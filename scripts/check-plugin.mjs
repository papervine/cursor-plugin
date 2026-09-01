#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Structural checks for this plugin, run in CI on every push and PR.
 *
 * Everything that can be wrong with a Cursor plugin is structural and silent: a plugin Cursor
 * can't parse looks exactly like a plugin nobody installed, and a skill that routes to a
 * reference file somebody renamed reads to the agent as "there is nothing more to know". None
 * of that surfaces as an error anywhere, which is why it's worth a gate.
 *
 * So this checks exactly what Cursor reads:
 *
 *   - the manifest exists at `.cursor-plugin/plugin.json` and is valid JSON with a `name`
 *   - `mcp.json` parses and every server has a `url` (or a `command`, for a stdio server)
 *   - every rules file has frontmatter — without it Cursor can't scope the rule
 *   - every skill directory holds a `SKILL.md` with `name` + `description` frontmatter
 *   - every command and agent file carries the same frontmatter
 *   - the manifest's `logo` resolves, and its `name` is the kebab-case Cursor requires
 *   - the SKILL.md reference index and the `reference/` directory agree **in both directions**
 *
 * That last one is the rule that earns its keep: a file nothing routes to is a file no agent
 * ever reads, and a route to a file that doesn't exist is a dead end.
 *
 *   node scripts/check-plugin.mjs
 */
export function checkCursorPlugin(dir) {
  const problems = [];
  const read = (rel) => readFileSync(path.join(dir, rel), "utf8");
  const dirs = (rel) => {
    const abs = path.join(dir, rel);
    if (!existsSync(abs)) return [];
    return readdirSync(abs).filter((e) => statSync(path.join(abs, e)).isDirectory());
  };

  // --- The manifest -------------------------------------------------------
  const manifestPath = ".cursor-plugin/plugin.json";
  if (!existsSync(path.join(dir, manifestPath))) {
    problems.push(`${manifestPath} is missing — Cursor has no plugin to load`);
  } else {
    try {
      const manifest = JSON.parse(read(manifestPath));
      if (!manifest.name) problems.push(`${manifestPath} has no "name"`);
      // Cursor's own validator requires a lowercase kebab-case name; a capital here is
      // rejected at submission rather than at install, which is a slow way to find out.
      if (manifest.name && !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name)) {
        problems.push(`${manifestPath} "name" must be lowercase kebab-case`);
      }
      if (!manifest.displayName) problems.push(`${manifestPath} has no "displayName"`);
      // A logo path that doesn't resolve is a broken image on the marketplace listing — the
      // one place a plugin gets judged before anyone installs it.
      if (manifest.logo && !existsSync(path.join(dir, manifest.logo))) {
        problems.push(`${manifestPath} "logo" points at ${manifest.logo}, which does not exist`);
      }
    } catch (err) {
      problems.push(`${manifestPath} does not parse: ${err.message}`);
    }
  }

  // --- MCP servers -------------------------------------------------------
  if (existsSync(path.join(dir, "mcp.json"))) {
    try {
      const mcp = JSON.parse(read("mcp.json"));
      const servers = mcp.mcpServers ?? {};
      if (!Object.keys(servers).length) problems.push("mcp.json declares no servers");
      for (const [name, server] of Object.entries(servers)) {
        if (!server?.url && !server?.command) {
          problems.push(`mcp.json server "${name}" has neither a url nor a command`);
        }
      }
    } catch (err) {
      problems.push(`mcp.json does not parse: ${err.message}`);
    }
  }

  // --- Rules -------------------------------------------------------------
  const rulesDir = path.join(dir, "rules");
  const rules = existsSync(rulesDir) ? readdirSync(rulesDir).filter((f) => f.endsWith(".mdc")) : [];
  if (!rules.length) problems.push("rules/ contains no .mdc file");
  for (const file of rules) {
    if (!read(path.join("rules", file)).startsWith("---\n")) {
      problems.push(`rules/${file} has no frontmatter — Cursor can't scope it`);
    }
  }

  // --- Commands and agents -----------------------------------------------
  // Both are plain Markdown with frontmatter. Cursor lists them by `name` + `description`, so
  // a file missing either is shipped but never offered to anyone.
  for (const kind of ["commands", "agents"]) {
    const kindDir = path.join(dir, kind);
    if (!existsSync(kindDir)) continue;
    for (const file of readdirSync(kindDir).filter((f) => f.endsWith(".md"))) {
      const src = read(path.join(kind, file));
      if (!src.startsWith("---\n")) {
        problems.push(`${kind}/${file} has no frontmatter`);
        continue;
      }
      const frontmatter = src.slice(4, src.indexOf("\n---", 4));
      for (const field of ["name", "description"]) {
        if (!new RegExp(`^${field}:\\s*\\S`, "m").test(frontmatter)) {
          problems.push(`${kind}/${file} frontmatter has no "${field}"`);
        }
      }
    }
  }

  // --- Skills ------------------------------------------------------------
  const skills = dirs("skills");
  if (!skills.length) problems.push("skills/ contains no skill directory");

  for (const skill of skills) {
    const skillFile = path.join("skills", skill, "SKILL.md");
    if (!existsSync(path.join(dir, skillFile))) {
      problems.push(`${skillFile} is missing`);
      continue;
    }
    const src = read(skillFile);
    for (const field of ["name", "description"]) {
      // Frontmatter only: a `name:` in the prose below doesn't make the skill loadable.
      const frontmatter = src.startsWith("---\n") ? src.slice(4, src.indexOf("\n---", 4)) : "";
      if (!new RegExp(`^${field}:\\s*\\S`, "m").test(frontmatter)) {
        problems.push(`${skillFile} frontmatter has no "${field}"`);
      }
    }

    const refDir = path.join("skills", skill, "reference");
    const onDisk = existsSync(path.join(dir, refDir))
      ? readdirSync(path.join(dir, refDir)).filter((f) => f.endsWith(".md"))
      : [];
    const referenced = new Set([...src.matchAll(/`reference\/([\w.-]+\.md)`/g)].map((m) => m[1]));

    for (const name of referenced) {
      if (!onDisk.includes(name)) {
        problems.push(`${skillFile} routes to ${refDir}/${name}, which does not exist`);
      }
    }
    for (const name of onDisk) {
      if (!referenced.has(name)) {
        problems.push(`${refDir}/${name} exists but ${skillFile} never routes to it`);
      }
    }
  }

  return problems;
}

// Run as a CLI when invoked directly (but importable, so a test could use it too).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const problems = checkCursorPlugin(root);
  if (problems.length) {
    console.error("This plugin would not load correctly:\n");
    for (const p of problems) console.error(`  ✗ ${p}`);
    console.error("");
    process.exit(1);
  }
  console.log("✓ manifest, mcp.json, rules and skill references all check out");
}
