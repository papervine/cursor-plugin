# Papervine for Cursor

A Cursor plugin that teaches Cursor how [Papervine](https://papervine.io) docs sites work — the
component set and their props, every `docs.json` and frontmatter field, how the sidebar is built,
and what the CLI can actually do.

It's a reference, three commands, and two MCP servers. The reference is written from the
renderer's source, so it describes what Papervine does rather than what a similar product does.

## Install

Not on the Cursor Marketplace yet. Until it is, clone it into Cursor's local plugin directory:

```bash
git clone https://github.com/papervine/cursor-plugin.git \
  ~/.cursor/plugins/local/papervine
```

Restart Cursor and it loads like any installed plugin.

Once it's listed, **Customize** in the sidebar → find **Papervine** → **Install**, choosing user
or project scope. Scope it to a project if you work on several docs sites with different
conventions.

## What's in it

| | |
|---|---|
| **A skill** | Loaded when you're working on docs. A short core file, plus six reference files it pulls in as needed. |
| **Writing rules** | Always on for `.mdx` and `docs.json` files: link format, frontmatter, house style. |
| **Three commands** | `/papervine-audit`, `/papervine-page`, `/papervine-migrate`. |
| **Two MCP servers** | Search Papervine's docs, and optionally read/edit a site through Papervine itself. |

### Reference files

The skill routes to these only when a task needs one, so they cost nothing the rest of the time.

| File | Covers |
|---|---|
| `components.md` | Every component with its props; defining your own React components; snippets |
| `docs-json.md` | The config file — themes, branding, banner, SEO, `llms.txt`, `skill.md`, and the frontmatter table |
| `navigation.md` | Groups, tabs, anchors, versions, and what each one actually renders |
| `api-reference.md` | OpenAPI and AsyncAPI setup, generated endpoint pages, the playground |
| `cli.md` | `new`, `dev`, `serve`, and serving a site in production |
| `gotchas.md` | The things that render as *something* instead of failing |

### Commands

| Command | What it does |
|---|---|
| `/papervine-audit` | Checks a docs repo for problems that don't announce themselves: pages missing from the nav, dead nav entries, unresolvable icons, relative links |
| `/papervine-page` | Writes a new page and adds it to `docs.json`, so it's actually reachable |
| `/papervine-migrate` | Reports what a docs repo from another platform will render unchanged, render differently, or ignore |

## What it prevents

Papervine is built so that one unsupported thing never breaks a page. That's good for readers and
awkward for an agent: most mistakes render as *something*, so nothing reports them.

Without a reference, Cursor guesses from other docs platforms — and the guesses look fine:

| The guess | What actually happens |
|---|---|
| `mode: wide` in frontmatter | Ignored. There is no per-page layout switch. |
| A Font Awesome icon name | Renders nothing at all. Icons are Lucide names only. |
| `papervine validate` | No such command. There are three: `new`, `dev`, `serve`. |
| A new page, and nothing else | It renders at its URL and appears in no sidebar — `docs.json` decides that. |
| Deleting a config key that logs a warning | Unknown keys are passed through on purpose, so migrated repos keep working. |
| `"hidden": true` on a tab | Ignored. The tab's *groups* carry it. |

## Connecting your own docs site

Every Papervine site serves read tools at `/mcp` — hosted, self-hosted, or a running
`papervine dev`. Adding yours gives Cursor live search over the pages you're writing:

```json
{
  "mcpServers": {
    "My Docs": { "type": "http", "url": "https://docs.example.com/mcp" }
  }
}
```

Put that in `.cursor/mcp.json` for one project, or `~/.cursor/mcp.json` for all of them. Use
`http://localhost:3000/mcp` to point it at a running `papervine dev`, including your unpublished
drafts.

## Editing

With the docs repo open, let Cursor **edit the files**. The change stays in your normal review and
commit flow, and that's what the skill and rules are for.

The plugin also ships Papervine's **authoring MCP** (`https://app.papervine.io/authoring/mcp`),
which reads and edits a site through Papervine rather than through your filesystem. Authorize it
once in a browser and Cursor holds a token that expires; edits buffer on a draft branch and go
live only when you save, as a commit or a pull request. Name the site with `x-papervine-org` and
`x-papervine-site` headers.

It's for when the repository *isn't* open — a hosted site, a quick fix from another machine.
Don't use both on the same page in one sitting: you'd have two uncoordinated copies, and whichever
publishes last wins.

## Using it outside Cursor

The plugin is packaged in Cursor's format, but the contents are plain Markdown — a `SKILL.md` and
six reference files. Any agent that reads a skill directory can use them: clone this repo and
point your tool at `skills/papervine/`.

## Contributing

Pull requests are welcome and get merged here. `node scripts/check-plugin.mjs` runs the same
structure check CI does, with nothing to install. See [CONTRIBUTING.md](CONTRIBUTING.md).

If the plugin tells you something Papervine doesn't do, that's worth an issue — a documented
behavior that doesn't match the renderer is worse than an undocumented one, because it gets acted
on with confidence. The most useful report is what Cursor produced, what Papervine actually does,
and which file said otherwise.

## License

MIT.
