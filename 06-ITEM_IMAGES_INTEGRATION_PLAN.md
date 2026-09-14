# Wiring Item Images Into the Product Cards

Your grid, filter, and pagination already work (per the screenshot) — this just adds the artwork. Continue using your standardized model (Sonnet-tier) for all of these; none of this needs the top tier.

## Prerequisite — do this yourself first, not via Copilot
Copy all 10 files from `game_images` into `public/assets/items/` in the FE repo (create the folder if it doesn't exist). Files in `public/` are served as-is at `/assets/items/<filename>` — no imports needed, which keeps Step 1 below simple.

## Step 1 — Title → image lookup map
Prompt:
```
Create src/utils/itemImages.js exporting ITEM_IMAGES, an object mapping exact product titles to filenames:
"Sword of Valor": "item_3d_sword_valor.jpg",
"Shield of Aegis": "item_3d_shield_aegis.jpg",
"Potion of Healing": "item_3d_potion_healing.jpg",
"Mystic Wand": "item_3d_mystic_wand.jpg",
"Ring of Invisibility": "item_3d_ring_invisibility.jpg",
"Helmet of Courage": "item_3d_helmet_courage.jpg",
"Armor of Fortitude": "item_3d_armor_fortitude.jpg",
"Boots of Speed": "item_3d_boots_speed.jpg",
"Gloves of Dexterity": "item_3d_gloves_dexterity.jpg",
"Cape of Shadows": "item_3d_cape_shadows.jpg"
Also export getItemImageUrl(title) returning `/assets/items/${ITEM_IMAGES[title]}`, or null if the title isn't in the map (don't guess a filename for unknown titles).
```

## Step 2 — Show it on the product card (ProductListing)
Prompt (attach `#file:src/pages/ProductListing.jsx` and `#file:src/utils/itemImages.js`):
```
In the product card component, import getItemImageUrl. Add an image block above the title: a fixed 4:3 aspect-ratio container, object-fit: cover, rounded top corners matching --radius-card. Track load failure with useState; if getItemImageUrl returns null OR the <img> fires onError, render a plain placeholder div in that same container instead (background --color-surface-hover, centered first letter of the title in --color-text-muted) rather than a broken-image icon.
```

## Step 3 — Show it on Product Details too
Prompt (attach `#file:src/pages/ProductDetails.jsx`):
```
Add the same image (or its placeholder fallback) as a larger hero block at the top of the details page, full-width, rounded corners matching --radius-card, using the same getItemImageUrl + onError-to-placeholder pattern as ProductListing.
```

## Step 4 — Verify
- All 10 unique titles show their correct artwork in the grid.
- Duplicate rows sharing a title (different price/location, like the two "Sword of Valor" cards in your screenshot) show the same image without extra network requests — the browser caches by URL automatically, so nothing extra to build here.
- Temporarily rename one product's title in a test to confirm the placeholder (not a broken-image icon) shows up for an unmapped title.
