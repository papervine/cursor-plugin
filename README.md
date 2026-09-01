# Papervine Cursor plugin

A Cursor plugin that gives Cursor a complete reference for building
[Papervine](https://papervine.io) docs sites — a Git repository of MDX pages plus one
`docs.json`, rendered by Papervine.

## What it does

Installs a `papervine` skill and writing rules that Cursor uses when working on a Papervine
docs repo.

The skill covers:

- **Components** — full syntax and props for every component Papervine ships (callouts, cards,
  steps, tabs, code groups, accordions, frames, badges, icons, tooltips, file trees, color
  swatches, changelog entries, prompts, API fields, panels, mermaid), plus how to define your
  own React components inside a page
- **Configuration** — the complete `docs.json` surface: the nine themes, colors, logo, favicon,
  appearance, navbar, banner, SEO metatags, `llms.txt`, `skill.md`, and the full page
  frontmatter table
- **Navigation** — groups, tabs, anchors, dropdowns, versions and languages, and how an
  OpenAPI spec becomes navigation
- **API docs** — OpenAPI and AsyncAPI setup, generated endpoint pages, the Try it playground,
  security requirements, and hand-written API pages
- **CLI** — `papervine new`, `dev`, and `serve`, their flags, and serving a site in production
- **The traps** — a `gotchas.md` collecting everything that renders as *something* instead of
  failing, which is most of what goes wrong on a renderer built never to break a page
- **Commands** — `/papervine-audit`, `/papervine-page`, `/papervine-migrate`

It also spells out the things an agent otherwise guesses wrong: which config keys are accepted
but not yet acted on, that icons resolve **Lucide** names only, that `"hidden": true` on a tab
is ignored, that only the first entry of a `versions` / `languages` wrapper renders, and that
the CLI has no `deploy`, `login`, or `validate`.

## Installation

Install from the [Cursor Marketplace](https://cursor.com/marketplace). Plugins can be installed
at the user level or scoped to a project.

## MCP setup

The plugin activates two MCP servers on install. They are different surfaces:

- **Papervine Docs** — read-only access to Papervine's published documentation at
  `https://docs.papervine.io/mcp`. No authentication. Tools: `search_docs`, `read_page`,
  `list_pages`. Use it to look up a component signature or config option the skill doesn't
  cover.
- **Papervine Authoring** — read *and edit* your own docs sites, at
  `https://app.papervine.io/authoring/mcp`. Authorize on first use: a browser tab opens, you
  approve the request, and the grant is an expiring OAuth token. Nothing to paste into a config
  file.

### Editing through the authoring server

Name the target site with two headers, `x-papervine-org` and `x-papervine-site`. Tools:
`read`, `search`, `list_pages`, `write_page`, `edit_page`, and `save`.

Edits buffer on a **draft branch** and are not live until `save` — `mode: "pr"` opens a pull
request, `mode: "commit"` writes to the deploy branch. The same draft buffer backs Papervine's
browser editor, so you can open the site and watch an agent's changes as they land. It requires
an organization role that can edit docs.

**In an editor, prefer editing the files.** If you have the docs repository open, a normal file
edit keeps the change in your usual review and commit flow. The authoring server earns its place
when the repository *isn't* open — a hosted site, a quick fix from another machine, an agent
working somewhere you aren't.

### Add your own docs site's read endpoint

Every Papervine site serves the read tools at `/mcp`, scoped to its own content — hosted,
self-hosted, or a running `papervine dev`. To give Cursor a live view of the docs you're
writing, add your host to `~/.cursor/mcp.json` (user-wide) or `.cursor/mcp.json` (this project):

```json
{
  "mcpServers": {
    "My Docs": { "type": "http", "url": "https://docs.example.com/mcp" }
  }
}
```

`http://localhost:3000/mcp` works against `papervine dev`. A site with an OpenAPI reference also
exposes `search_api`.

## Skills included

### `papervine`

The skill loads a concise core reference and routes to detailed files only when the task needs
them.

| Reference file | Contents |
|----------------|----------|
| `reference/components.md` | Every component, its props, and the two forms `<Tree>` accepts; author-defined React components; snippets |
| `reference/docs-json.md` | The one config file: themes, colors, branding, banner, SEO, `llms.txt`, `skill.md`, and the frontmatter table |
| `reference/navigation.md` | Groups, tabs, anchors, versions — and what each division actually renders |
| `reference/api-reference.md` | OpenAPI/AsyncAPI setup, generated pages, the playground, hand-written API pages |
| `reference/cli.md` | `new`, `dev`, `serve`, their flags, production serving, trust model |
| `reference/gotchas.md` | The things that render as *something* rather than failing — read before concluding a site is broken |

## Commands included

| Command | What it does |
|---------|--------------|
| `/papervine-audit` | Sweeps a docs repo for the mistakes that fail silently — unreachable pages, dead nav entries, unresolvable icons, relative links, config keys that do nothing |
| `/papervine-page` | Adds a page: frontmatter, a shape matching its neighbours, and the `docs.json` entry people forget |
| `/papervine-migrate` | Assesses a docs repo from another platform — what renders unchanged, what renders differently, what does nothing |

## Rules included

### `rules/papervine.mdc`

Writing guardrails that activate when editing `.mdx` files or `docs.json`:

- Where a page lives, and why `docs.json` decides whether anyone can find it
- Why internal links are root-relative (a site is served three different ways)
- The frontmatter fields that exist, with what each one changes
- House style, most of it downstream of how the renderer behaves
- The mistakes that cost an afternoon: an ignored `hidden` on a tab, a Font Awesome icon
  name, a trailing comma

## Migrating from another docs platform

Papervine reads the same `docs.json` schema, so an existing docs repo generally renders
unchanged — including keys Papervine doesn't act on yet, which are passed through with a
warning rather than rejected. The skill documents where behavior differs so you don't have to
discover it page by page.

## Contributing

Pull requests welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). `node scripts/check-plugin.mjs`
runs the same structure check CI does, with nothing to install.

If the plugin tells you something Papervine doesn't do, that's a bug in the same sense a broken
component is. The most useful report is what the agent produced, what Papervine actually does,
and which file said otherwise.

## License

MIT. Not affiliated with any other documentation platform.
