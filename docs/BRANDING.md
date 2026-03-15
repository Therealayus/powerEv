# EV Charging — Logo & Branding

## Overview

- **App (driver):** **EV Charging** — find stations and charge.
- **Partner (web):** **EV Charging Partner** — manage stations and sessions.

Shared visual system: dark UI, green primary, blue accent.

---

## Logo Assets

| Asset | Use |
|--------|-----|
| `assets/ev-charging-icon.png` | App icon, favicon, small UI mark |
| `assets/ev-charging-wordmark.png` | App: splash, login, in-app header |
| `assets/ev-charging-partner-wordmark.png` | Partner: header, login, register |

**Web:** Copies live in `web/public/` as `favicon.png`, `logo-app.png`, `logo-partner.png` (favicon + header/login use).

**Mobile:** Use `ev-charging-icon.png` or `ev-charging-wordmark.png` from `mobile/src/assets/` for splash and auth screens. The app wordmark matches the partner logo style (same green icon + white wordmark on dark) for consistent branding across both apps.

---

## Colors (design tokens)

| Role | Hex | Usage |
|------|-----|--------|
| Background | `#0F172A` | Page/screen background |
| Card | `#1E293B` | Cards, header, inputs |
| Primary | `#22C55E` | CTAs, links, success, logo accent |
| Accent | `#3B82F6` | Secondary links, info |
| Text | `#F8FAFC` | Primary text |
| Text secondary | `#94A3B8` | Descriptions, hints |
| Border | `#334155` | Dividers, outlines |
| Error | `#EF4444` | Errors, destructive |
| Warning | `#F59E0B` | Warnings, markers |

---

## Typography

- **Headings:** Bold, sans-serif (e.g. system or Inter).
- **Body:** Regular, good readability on dark (e.g. 16px base).
- **Small / captions:** Lighter weight, secondary color.

(Exact font stack is in each app’s theme/Tailwind config.)

---

## Logo Usage

- **Clear space:** Keep a small margin around the logo (e.g. height of the icon).
- **Minimum size:** Icon at least 24px; wordmark readable at ~32px height.
- **Backgrounds:** Logos are safe on dark (`#0F172A`, `#1E293B`); avoid busy imagery behind.
- **Don’t:** Stretch, change colors, or add effects (shadow/glow) to the logo.

---

## Where It’s Used

| Place | Asset |
|--------|--------|
| Partner web favicon | `web/public/favicon.png` |
| Partner web header | `logo-partner.png` |
| Partner login/register | `logo-partner.png` |
| Mobile app icon | Use `ev-charging-icon.png` in `app.json` / native config |
| Mobile login/register | Icon or wordmark in auth screens |

---

**Doc maintenance:** Update this file when adding new logo variants or changing brand colors.
