# Contributing

Pull requests are welcome and get merged here. This repository is the source of truth for the
plugin — there is nothing to sync it with and nothing to port upstream.

## Running the checks

```bash
node scripts/check-plugin.mjs
```

No install step; it's plain Node against the files in the repo. CI runs the same command on
every push and pull request. It verifies the things that fail silently: the manifest parses,
every MCP server has a URL, every rules file has frontmatter, every skill has `name` and
`description`, and the `SKILL.md` reference index and the `reference/` directory agree in both
directions.

## Trying a change before you send it

Install the plugin from a local path in Cursor (**Customize → Plugins**), point it at your
clone, and open a Papervine docs repo. The useful test is whether the agent stops guessing:
ask it something the change is meant to cover and see whether it now gets it right without
being told.

## What makes a good change

- **Correct beats complete.** The whole value here is that an agent stops inventing things. A
  documented behavior that doesn't match the renderer is worse than an undocumented one,
  because it gets acted on with confidence.
- **Verify against a running site.** `npx papervine@latest dev` in a docs folder renders the
  real thing. If you're describing a prop, render it first.
- **Say what doesn't work, too.** The "Fields that do not exist" and "These commands do not
  exist" sections earn their place — they stop an agent reaching for a plausible-looking option
  that another docs platform has and Papervine doesn't.
- **Keep the core file short.** `skills/papervine/SKILL.md` loads on every task; the
  `reference/` files load only when the task needs them. New detail belongs in a reference
  file, and the core should route to it.
- **Every `reference/*.md` must be named in the SKILL.md index**, and every file the index
  names must exist. A file nothing routes to is a file no agent reads. The check enforces both
  directions.

## Reporting a problem

The most useful report is what the agent produced, what Papervine actually does, and which file
said otherwise. That usually turns into a one-line fix.

For a bug in the renderer rather than this reference, open it against
[papervine/papervine](https://github.com/papervine/papervine).
