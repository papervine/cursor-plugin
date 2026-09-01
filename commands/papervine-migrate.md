---
name: papervine-migrate
description: Assess a docs repo from another platform against Papervine — what renders unchanged, what renders differently, and what does nothing.
---

# Assess a migration

Papervine reads the same `docs.json` schema as other docs platforms, so most repos render
unchanged with nothing moved. The value of this command is the honest remainder: the handful of
things that render *differently* or not at all, found before the author discovers them page by
page.

Unknown config keys are passed through with a warning rather than rejected — that is deliberate,
and it means **a clean render is not proof everything works**. Something inert looks identical
to something unsupported.

## Read the repo, then report three lists

Consult the `papervine` skill's reference files for what is actually supported; don't infer it
from whether a page renders.

**Renders unchanged.** State it briefly — this is most of the repo, and the author mainly needs
to know the list is short on the other two sides.

**Renders differently.** Each with what the reader will actually see:

- `<Icon>` and every `icon` field resolve **Lucide** names only. Font Awesome and Tabler names
  render nothing — invisible rather than broken, so grep for them specifically.
- Sibling `<View>` blocks render as separate labelled sections, not one dropdown. Nothing is
  hidden; the page is longer.
- `<Panel>`, `<RequestExample>`, `<ResponseExample>` render inline, not in the right column.
  Examples sit below the prose instead of beside it.
- Only the first entry of a `versions` or `languages` wrapper renders. If the repo has several,
  say plainly that the rest become unreachable from the nav.
- An anchor with an `href` and no pages renders nothing. Off-site links belong in `navbar.links`.

**Does nothing.** Accepted, warned about, no effect: `redirects`, `icons`, `integrations`,
`contextual`, `api`, and `footer`. In frontmatter: `mode`, `openapi`, `api`, `searchable`,
`boost`, `deprecated`, `related`.

Leave these in place. They cost nothing, they keep the repo portable, and they light up as
features land. Recommend deleting nothing.

## Two things worth calling out by name

**API reference.** Papervine generates endpoint pages from an `openapi` property on a navigation
division. A top-level `"openapi"` key does nothing, and neither does `openapi:` in a page's
frontmatter — so a repo that declares endpoint pages that way has an API reference that silently
disappears. Check for it explicitly.

**Reader-gated pages.** `groups:` frontmatter works on hosted Papervine. Served by the CLI there
is no reader auth at all, so those pages are public — including through the site's `/mcp`
endpoint. Say so if the repo has any.

## Finish with the actual next step

Recommend running `npx papervine@latest dev` against the repo and opening the pages your report
flagged. A rendered page settles an argument that reading the config cannot.
