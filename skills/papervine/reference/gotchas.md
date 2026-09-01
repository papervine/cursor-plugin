# Gotchas

Papervine's core promise is that one unsupported thing never takes down a page. Unknown
components degrade to their children, a page that won't compile shows an inline notice, and an
unrecognised config key is passed through with a warning.

That is the right trade, and it has a cost worth naming: **almost every mistake renders as
something.** There is no stack trace, no red build, no 500. A misspelled component is plain
text. An unlisted page is a URL nobody can find. A Font Awesome icon name is nothing at all.

This file is the list of things that look like they work. Read it before telling someone their
site is fine, and before "fixing" a config you think is wrong.

## Silently ignored

| You wrote | What happens | Do this instead |
| --- | --- | --- |
| `"hidden": true` on a **tab** | Ignored. The tab keeps rendering. | Mark its groups hidden — a tab with no reachable pages disappears on its own. |
| A second entry under `versions` / `languages` | Only the first renders. The rest are unreachable from the nav. | Don't add one to a site that has none; there is no switcher yet. |
| `{ "anchor": "Community", "href": "…" }` | Nothing. An anchor is a *container*, and one with no pages is pruned. | Off-site links go in `navbar.links` or `navbar.primary`. |
| `navigation.global` | Parsed, never rendered. | Put the divisions directly on `navigation`. |
| A top-level `"openapi"` key | Nothing. Only navigation divisions are scanned for specs. | Put `openapi` on a tab or a group. |
| `openapi:` / `api:` in page frontmatter | Nothing. A page cannot declare itself an endpoint page. | Point a nav division at the spec. |
| `mode: wide` (and `searchable`, `boost`, `deprecated`, `related`) | Nothing. Not read. | There is no per-page layout switch. |
| `footer` in `docs.json` | Parsed, not rendered yet. | Nothing to do — leave it. |
| A Font Awesome or Tabler icon name | Renders nothing. Not a broken glyph — an absence. | Lucide names only, or `<Icon src="/path.svg" />`. |
| A misspelled component | Renders its children as plain content. | Check the name in `components.md`. |
| `<video>` with no `muted` on an autoplaying clip | Browsers block it; the video never starts. | `autoPlay muted loop playsInline`. |
| A `youtube.com/watch?v=…` URL in an `<iframe>` | Won't play. | Use the `/embed/` URL. |
| A page in no nav group | Renders at its URL, appears in no sidebar. | Add it to `docs.json` — or leave it, if parking a draft is the point. |

## Actually breaks

Short list, because there is only one thing that reliably takes a site down:

**Invalid JSON in `docs.json`.** A trailing comma is almost always the cause. It presents as a
site that renders but looks unstyled — which sends people hunting through CSS and themes. Check
the config parses first, every time.

An author-defined component that throws shows an inline notice on that page. The rest of the
site is unaffected.

## Leave these alone

Papervine passes unrecognised `docs.json` keys through **on purpose** — it is what lets a repo
from another platform render unchanged. `redirects`, `icons`, `integrations`, `contextual` and
`api` all warn and do nothing.

A warning is not a deletion instruction. The keys cost nothing, they keep the repo portable, and
they light up as features land. Don't tidy them away, and don't "tighten" a config by making
fields required — a malformed value degrading to its default is the intended behaviour.

## Two spellings of the index page

`docs.json` writes it `"index"`. Its route is `/`. Compare those and you will conclude the index
page is both missing from the nav and missing from disk. It is neither.

## Author components run in the browser

A component you define in a page is evaluated client-side, never on the server. Two consequences
people hit:

- It appears a moment after the surrounding text, once the page is interactive. Server-rendered
  HTML — what search engines and `llms.txt` see — doesn't include it.
- `{process.env.ANYTHING}` has nothing to read. There is no server-side step where page code
  runs. Values fixed at publish time belong in `docs.json` or frontmatter.

And the contract is narrow: named arrow functions assigned to a `const`, imports only from
`/snippets/`. `export default`, `function` declarations, npm imports and dynamic `import()` all
degrade to a notice instead of rendering.

## The CLI is a previewer

There is no `deploy` and no `login`, and no `validate`, `broken-links`, `a11y` or `score`
either. Three commands: `new`, `dev`, `serve`. Publishing happens through Git.

`papervine dev` has **no hot reload** — pages read from disk per request, so saving and
refreshing shows the change. If someone reports "my edit didn't show up", ask whether they
refreshed before assuming a cache.

A self-hosted site has **no reader auth**. Pages carrying `groups:` are public there, including
through its `/mcp` endpoint.
