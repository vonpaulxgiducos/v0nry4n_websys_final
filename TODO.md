# Light Mode Sidebar - TODO

## Plan
Update all 3 role dashboard sidebars from dark mode to light mode.

## Files to Edit
1. [ ] `resources/js/pages/admin/dashboard.tsx`
2. [ ] `resources/js/pages/seller/dashboard.tsx`
3. [ ] `resources/js/pages/dashboard.tsx`

## Color Mapping (Dark -> Light)
| Current (Dark) | New (Light) |
|---|---|
| `bg-[#071137]` | `bg-white` |
| `border-slate-700/80` | `border-slate-200` |
| `text-slate-100` | `text-slate-900` |
| `text-slate-300` | `text-slate-600` |
| `text-slate-400` | `text-slate-500` |
| `hover:bg-slate-800` | `hover:bg-slate-100` |
| `hover:text-slate-100` / `hover:text-white` | `hover:text-slate-900` |
| `bg-slate-800` (active nav) | `bg-slate-100` |
| `bg-slate-700` (active icon) | `bg-slate-200` |
| `bg-slate-800` (inactive icon) | `bg-slate-100` |
| `text-white` (active) | `text-slate-900` |
| `border-slate-600/60` (divider) | `border-slate-200` |
| `bg-rose-950/50`, `text-rose-300` | `bg-rose-50`, `text-rose-600` |
| `hover:bg-rose-900/60`, `hover:text-rose-100` | `hover:bg-rose-100`, `hover:text-rose-700` |
| Dark shadow | `shadow-sm` |

