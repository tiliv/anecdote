# Anecdote

This repository is being architected to meet several local need layers.

Please Stand By.

## Dev

To see good changes on the dev server:

1. Use `$ bin/build-local.sh` after changes to `docs/index.html`, `docs/_data/payload.js`, `docs/.well-known/manifest.json`. These files represent the foundation and probably shouldn't be changing once they settle.
2. No full build needed if only changing resources referenced by `docs/.well-known/manifest.json`.

Side effect file changes should be committed, because the build pipeline is not concerning itself with these steps.

### Commands

These local-only commands help by including the `_config_dev.yml` extension to canonicalize `127.0.0.1:4000` as the host for CSP adherence.

- Use `$ npm run localbuild` to inspect static artifacts that would be published.
- Use `$ npm run dev` to get the `$ cd docs && bundle exec jekyll serve` behavior from anywhere.

### Bundle & Jekyll setup

- `bundle` is a `ruby` tool, and jekyll is distributed on that ecosystem.
- `Gemfile` is what `bundle` wants to see to signify a project root like a package.json, and contains the jekyll dependency for local build/serve support.
- Use `$ bundle install` (or any other args) in `docs/`, where `Gemfile` is present.
- Use `$ npm run dev` to ignore your local relative path to `docs/`.
