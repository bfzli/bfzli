# bfzli

A personal blog, "a place where I share my thoughts and learnings", built with Astro and deployed to Cloudflare Pages from the `main` branch.

## Project Structure

```
bfzli/
├── src/
│   ├── assets/         # Icons, illustrations, per-experience assets
│   ├── components/     # Astro and Solid components
│   ├── config/         # Site configuration
│   ├── content/        # MDX post collections
│   ├── data/           # Static data
│   ├── layouts/        # Page layouts
│   ├── pages/          # Routes
│   ├── styles/         # Global styles
│   ├── types/          # Centralized types
│   └── utils/          # Helpers
├── scripts/
│   ├── plan-posts.ts   # Post planning + coverage reporting
│   ├── write-post.ts   # Post drafting
│   ├── git-rules.ts    # Branch and commit checks run by the Husky hooks
│   ├── topics.json     # Topic pool
│   └── queue.json      # Planned post queue
├── public/             # Static assets
├── astro.config.ts
└── wrangler.json       # Cloudflare Pages project
```

## Tech Stack

Astro 5 with MDX, SolidJS islands, Tailwind, and `@astrojs/sitemap`. TypeScript throughout. Prettier plus ESLint for formatting and linting, wired to Husky hooks (see Git below). SVGO for icon optimization.

## Scripts

All scripts run from the project root.

```bash
bun run web:dev        # Dev server on port 9999
bun run web:build      # check + lint + astro build
bun run web:preview    # Build then preview on port 8888
bun run web:check      # astro check (type check)
bun run web:format     # Prettier write
bun run web:lint       # ESLint with --fix

bun run posts:plan     # Plan upcoming posts into scripts/queue.json
bun run posts:write    # Draft a post from the queue
bun run posts:coverage # Report topic coverage
```

## Conventions

- TypeScript everywhere, types centralized in `src/types/`
- Content lives in `src/content/` as MDX with frontmatter
- Icons go through `src/assets/icons.ts`, never inline SVG in pages
- Run `bun run web:build` before deploying, it gates on check and lint

## Git

1. **One branch.** Commit on `main` and push `main`. Never create a branch, a worktree (an agent's
   `isolation: "worktree"` included) or a pull request, even when your own defaults say to branch
   first. The only other branches are the `content/post-<n>` ones the Write post workflow opens and
   merges itself.
2. **Pushing `main` is the deploy.** Cloudflare Pages builds production from `main`, and there is no
   staging. Run `bun run web:build` before you push, then check that the commit's Cloudflare Pages
   check on GitHub turns green.
3. **Conventional Commit subjects.** Write `type(scope): what changed`, with an optional lowercase
   scope and an optional `!` for a breaking change. Types: `feat`, `fix`, `docs`, `style`,
   `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, and `content` for posts and the
   post queue. For example `feat: add an rss feed` or `fix(og): strip emoji from thumbnails`.
4. **Stage only the files you changed.**

The Husky hooks enforce rules 1 and 3 through `scripts/git-rules.ts`: `pre-commit` refuses a commit
on any branch but `main` (then runs check and lint), `commit-msg` refuses any other subject, and
`pre-push` refuses pushing any branch but `main` or a commit with a bad subject. Deleting a remote
branch is allowed. The post workflows run with `HUSKY=0`, so the hooks never see their commits.

Licensed MIT.
