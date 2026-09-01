# Papervine for Cursor

Ask Cursor to add a page to a [Papervine](https://papervine.io) docs site and, without a
reference, it will confidently write `mode: wide` into the frontmatter, reach for a Font Awesome
icon name, and tell you to run `papervine validate`. None of those exist. Worse, none of them
*fail* — Papervine is built so one unsupported thing never breaks a page, so the frontmatter is
ignored, the icon renders nothing, and only the CLI command errors.

This plugin gives Cursor the reference, taken from the renderer's own source.

```
Install → Cursor Marketplace → search "Papervine"
```

Scope it to a project if you work on several docs sites with different conventions.

---

## What stops going wrong

The plugin is mostly a long answer to "what will actually happen if I write this".

| Cursor used to | Now |
|---|---|
| Invent frontmatter from a similar product (`mode`, `openapi`, `searchable`) | Knows the eleven fields that exist, and that those four don't |
| Suggest `papervine validate` / `deploy` / `broken-links` | Knows there are three commands: `new`, `dev`, `serve` |
| Use a Font Awesome icon name | Knows icons resolve **Lucide** names only, and that a miss renders nothing |
| Write a page and stop | Adds the `docs.json` entry, without which nobody can find it |
| Guess a component's props | Has every component, every prop, and the two forms `<Tree>` accepts |
| Delete a config key that "warns" | Knows pass-through is deliberate, and leaves migrated repos alone |
| Put `"hidden": true` on a tab | Knows that's ignored, and marks the groups instead |

That last column is the whole product. A renderer that never breaks a page is a renderer where
mistakes are *quiet*, and quiet mistakes are the ones an agent makes confidently.

## Three commands

| | |
|---|---|
| `/papervine-audit` | Sweeps a repo for what fails silently — unreachable pages, dead nav entries, unresolvable icons, relative links, keys that do nothing |
| `/papervine-page` | Writes a page *and* wires it into `docs.json` |
| `/papervine-migrate` | Reports what a repo from another platform renders unchanged, differently, or not at all |

## What Cursor reads

A `papervine` skill loads a short core file on every docs task and pulls in a reference file
only when the work needs one:

| | |
|---|---|
| `components.md` | Every component and its props; author-defined React components; snippets |
| `docs-json.md` | The one config file — themes, branding, banner, SEO, `llms.txt`, `skill.md`, frontmatter |
| `navigation.md` | Groups, tabs, anchors, versions, and what each actually renders |
| `api-reference.md` | OpenAPI/AsyncAPI, generated endpoint pages, the playground |
| `cli.md` | `new`, `dev`, `serve`, and serving a site in production |
| `gotchas.md` | Everything that renders as *something* instead of failing |

Plus `rules/papervine.mdc`, always on for `.mdx` and `docs.json`: link format, frontmatter,
house style, and the mistakes worth an afternoon.

## Two MCP servers

**Papervine Docs** — `https://docs.papervine.io/mcp`, no auth. Read-only search over Papervine's
own documentation, for anything the reference doesn't cover.

**Papervine Authoring** — `https://app.papervine.io/authoring/mcp`. Reads *and edits* a site you
can edit. Authorize once in a browser; the client holds an expiring OAuth token. Name the target
with `x-papervine-org` and `x-papervine-site` headers. Edits buffer on a draft branch and go live
only on `save`, as a commit or a PR.

> **With the repo checked out, edit the files.** That keeps the change in your normal review and
> commit flow. The authoring server is for when the repository *isn't* open — a hosted site, a fix
> from another machine. Don't use both on one page: two uncoordinated copies, last publish wins.

To point Cursor at your **own** site's docs (every Papervine site serves the read tools at
`/mcp`), add it to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "My Docs": { "type": "http", "url": "https://docs.example.com/mcp" }
  }
}
```

`http://localhost:3000/mcp` works against a running `papervine dev`, which gives the agent your
unpublished drafts.

## Not just Cursor

Packaged in Cursor's format, but the material is plain Markdown — a `SKILL.md` and six reference
files. Any agent that can read a skill directory can use it: clone this and point your tool at
`skills/papervine/`.

## When it's wrong

That's a bug in the same sense a broken component is — a documented behavior that doesn't match
the renderer is worse than an undocumented one, because it gets acted on with confidence.
[Open an issue](https://github.com/papervine/cursor-plugin/issues) with what the agent produced
and what Papervine actually does, or send a PR.

`node scripts/check-plugin.mjs` runs the structure check CI runs, with nothing to install. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. Not affiliated with any other documentation platform.
