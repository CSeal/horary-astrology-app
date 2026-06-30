# Vendored: avoid-ai-writing detector

`patterns.js` is the zero-dependency AI-writing detection engine from
[conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing),
MIT-licensed (see `LICENSE`). Vendored verbatim — do not edit; re-pull from upstream to update.

- Source commit: `6e1369dad98e61b165928f3849f225e11855cdaf`
- Vendored: 2026-06-30
- API: `require('./patterns.js').analyzeText(text, { contextMode })` → `{ score, label, issues[], document_classification, ... }`

Used by `scripts/copy-audit.js` to flag AI-writing tells in our store metadata and i18n copy.
