# Community Bank Manager branding

Add the uploaded logo to the app and retheme the UI around its red + cyan palette.

## Logo placement
- Upload the logo as a CDN asset pointer and add a small `BrandLogo` component.
- Show it on: the login card (above the form), the dashboard sidebar header, and the mobile header.
- Use it as the favicon and update the page titles/meta to "Community Bank Manager".

## Color theme
Derived from the logo:
- Primary red `#E11D26` (buttons, active sidebar item, key accents)
- Secondary cyan `#29ABE2` (links, highlights, badges, charts)
- Neutral near-white background in light mode, deep navy-charcoal surfaces in dark mode

Applied by replacing the amber/slate tokens in `src/styles.css`:
- `--primary` / `--sidebar-primary` -> logo red, with white foreground
- `--accent` / `--ring` / `chart tokens` -> cyan family
- Adjust `--secondary`, `--muted`, `--border` to cool neutrals that sit well with red + cyan
- Both `:root` (light) and `.dark` blocks updated so contrast stays accessible

No component logic changes — only tokens plus the logo markup.

## Technical notes
- `lovable-assets create` from the uploaded PNG, pointer JSON in `src/assets/`
- Favicon written as a real downscaled PNG in `public/` and referenced from `__root.tsx`
- All colors stay `oklch` semantic tokens; no hardcoded color classes in components
