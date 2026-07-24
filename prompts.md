# Mizan prompts

Give each verbatim to the AI tool, then save its output to `outputs/<tool>/<n>.tsx` (or `.css`).
Each prompt ends with: **"It must render correctly in Arabic (right-to-left)."**

1. A login form (email, password, submit) with a "Back" link.
2. A product card: image, title, price, "Add to cart", a heart icon.
3. A top nav bar: logo on the leading side, menu items trailing.
4. A pricing table, three tiers, check/cross feature icons.
5. A chat message list with avatars and timestamps.
6. A sidebar with collapsible sections and chevron icons.
7. A breadcrumb trail with chevron separators.
8. A dashboard: 4 KPI cards with up/down arrows.
9. A settings page: labels leading, toggles trailing.
10. A date-range picker with prev/next arrows.
11. A toast that slides in from the corner.
12. A file-upload dropzone with a progress bar.
13. A comment thread with reply/indent.
14. A checkout summary: items, subtotal, currency, "Place order".
15. A hero with headline, subtext, and a forward-pointing CTA.

Then: `node score.js outputs`
