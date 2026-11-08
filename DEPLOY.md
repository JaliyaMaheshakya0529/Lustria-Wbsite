# Netlify deployment instructions

This archive contains the repaired `src/` and a root-level `netlify.toml`.
It is a patch, NOT a standalone project. Keep your existing `package.json`,
`index.html`, `public/` images (especially `/logo.png` and `/bg-img.png`), and
existing dependencies.

1. Replace your project's `src/` with this folder.
2. Put `netlify.toml` in the PROJECT ROOT next to `package.json`.
3. Run `npm run build` locally and confirm the build succeeds.
4. Commit/push the files to the branch connected to Netlify, or deploy the new
   `dist/` folder. Netlify must build from the UPDATED project sources.
5. In Netlify, use the new deploy's URL, then hard-refresh (Ctrl+Shift+R) or
   open an incognito tab. Reset browser site zoom with Ctrl+0.
6. Test direct refresh on `/collection`, mobile filters, and sorting.

If the hosted site still looks old, confirm Netlify's deploy log shows the newest
commit. The original upload had only `src/`, so the actual site was not fully
built or tested against your project's original dependencies and assets.
