---
name: papervine-page
description: Add a page to a Papervine docs site — frontmatter, a structure that matches its neighbours, and the docs.json nav entry that makes it reachable.
---

# Add a page

A new `.mdx` file is not a new page. Papervine builds the sidebar from `docs.json` alone, so a
file nobody listed renders at its URL and appears nowhere. **The nav entry is the half people
forget**, and the page looks fine when you visit it directly, so the mistake survives review.

## Before writing

1. Read `docs.json` — the groups, the tabs, and where a page of this kind belongs.
2. Read 2–3 sibling pages. Match their voice, their heading depth, and which components they
   reach for. A page that reads differently from its neighbours is a worse page even when every
   sentence is good.
3. Search for the topic first. Often the right change is a section in an existing page, and
   adding a thin new page instead makes the site harder to navigate, not more complete.

Ask where it belongs only if the answer isn't obvious from the nav. Otherwise pick, write, and
say which group you chose.

## Write it

Frontmatter carries `title` and a real `description` — that is the line search results,
`llms.txt`, and social cards use, so "Documentation for the widgets API" is a wasted line.

Then the page. Open with what the reader gets, not with prerequisites: someone arriving from
search needs one sentence telling them they're in the right place.

Reach for the component set where it earns its place — `<Steps>` for an ordered procedure,
`<CodeGroup>` for the same task in several languages, `<Warning>` for the thing that bites.
Prose is the default; a page of stacked components is harder to read than paragraphs.

Consult the `papervine` skill's `reference/components.md` for props rather than guessing. A
component that doesn't exist renders as its own children, so a wrong name produces a page that
looks merely plain.

## Wire it up

Add the slug to the right group in `docs.json` — path relative to the docs root, **no
extension**, and `"index"` for the index page. Put it in reading order, not alphabetical.

## Then

Tell the author what you added, which group it went in, and what you'd write next if the section
now reads as incomplete. If `papervine dev` is running, the page is live on a refresh.
