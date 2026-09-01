---
name: papervine-audit
description: Check a Papervine docs repo for the mistakes that fail silently — pages missing from the nav, dead links, unresolvable icons, config keys that do nothing.
---

# Audit a Papervine docs repo

Papervine is built to never break a page, which is a good property with one cost: most mistakes
render as *something* rather than as an error. A misspelled component becomes plain text, an
unlisted page becomes unreachable, a bad icon renders nothing at all. Nobody gets a stack trace.
This finds those.

Read the `papervine` skill's `reference/gotchas.md` first — it is the list this command checks.

## What to check

Work from `docs.json` and the `.mdx`/`.md` files beside it. Report findings grouped by severity,
each with the file, the line, and the fix.

**Reachability**

1. Every page file that no nav group lists. Some are deliberate (a parked draft); say so and let
   the author decide, don't "fix" them.
2. Every nav entry pointing at a file that doesn't exist — a 404 in the sidebar.
3. `"hidden": true` on a **tab**, which is silently ignored. The groups must carry it instead.
4. More than one entry under `versions` or `languages` — only the first renders, so the rest are
   invisible.

**Links and assets**

5. Relative internal links (`../guides/auth`) and links carrying a file extension
   (`/guides/auth.mdx`). Both break under at least one of the three ways a site can be served.
6. Links to page slugs that don't exist.
7. Images referenced with a path no file matches, and images with no alt text.

**Components**

8. Capitalized JSX tags that aren't in the component set and aren't defined in the page. These
   degrade to their children, so the page looks thin rather than broken.
9. `icon` values — in frontmatter, in `docs.json`, and on components — that aren't Lucide names.
   An unresolvable icon renders nothing.
10. Author-defined components breaking the contract: `export default`, `function` declarations,
    imports from anywhere but `/snippets/`, dynamic `import()`.

**Config and frontmatter**

11. `docs.json` that isn't valid JSON. This is the one thing that *does* break the site, and a
    trailing comma is almost always the cause.
12. Frontmatter fields Papervine doesn't read — `mode`, `openapi`, `api`, `searchable`, `boost`
    — which authors carry over from other platforms and then wonder why nothing happened.
13. Pages with no `description`: no search-result line, no social card text.

## How to report

Lead with the count and the single most consequential finding. Then a table: file, line, what
breaks, and the fix.

Separate **broken** (a reader hits it) from **inert** (a key that does nothing). Inert keys are
often deliberate — Papervine passes unknown config through on purpose so a migrated repo keeps
rendering — so flag them as "no effect", never as "delete this".

Fix nothing without being asked. Finish the audit, then offer.
