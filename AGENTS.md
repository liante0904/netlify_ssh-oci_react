# Frontend Working Guide

This repository owns the React/Vite reports UI. It consumes backend contracts;
it does not fix missing database rows or scrape source websites.

## Read order

1. `ARCHITECTURE.md`
2. the target view/component under `src/`
3. its API client and relevant tests

## Verification

```bash
git status --short --branch
npm run test
npm run build
```

When changing an API field, first confirm the backend payload in
`../backend/ssh-reports-hub-fastAPI`; do not conceal duplicate or missing data
in the UI without confirming its database/API identity.
