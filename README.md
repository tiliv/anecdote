# Anecdote

This repository is being architected to meet several local need layers.

1. The distribution of a long-lived QR+Aztec code that can load its signed resources with a public key.
2. The spawnability of a mobile LLM capable of label-reducing text in an assistive capacity, without a network.
3. The fundamental privacy of queries formed.
4. The availability of public workflows that model our local communities' documentation habits and the array of TTLs.
5. The proliferation of live passive polling of the public with implicit moderation and public transparency.

Please Stand By.

## Dev

To see good changes on the dev server, you must pre-build some files into the live `docs/` tree:

1. Use `$ npm run localbuild` after changes to `docs/index.html`, `docs/_data/payload.js`, `docs/.well-known/manifest.json`. These files represent the foundation and probably shouldn't be changing once they settle.
2. No build needed if only changing resources referenced by `docs/.well-known/manifest.json`.

Side effect file changes should be committed for a proper runnable dev server that can pass testing. In CI, the server will build its own without committing, because it will sign files that differ when it produces a hosted version.

### Commands

These local-only commands help by including the `_config_dev.yml` extension to canonicalize `127.0.0.1:4000` as the host for CSP adherence.

- Use `$ npm run localbuild` to inspect static artifacts that would be published.
- Use `$ npm run dev` to get the `$ cd docs && bundle exec jekyll serve` behavior from anywhere.

### Bundle & Jekyll setup

- `bundle` is a `ruby` tool, and jekyll is distributed on that ecosystem.
- `Gemfile` is what `bundle` wants to see to signify a project root like a package.json, and contains the jekyll dependency for local build/serve support.
- Use `$ bundle install` (or any other args) in `docs/`, where `Gemfile` is present.
- Use `$ npm run dev` to ignore your local relative path to `docs/`.
