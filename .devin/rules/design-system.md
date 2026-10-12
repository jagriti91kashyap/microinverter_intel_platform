# Enphase Energy Design System Rules

## Brand Colors
- **Primary**: Enphase Orange (#F26322)
- Use as --primary, --accent, --ring CSS variables
- Chart bars use #F26322
- KPI icon backgrounds: bg-enphase-500, bg-blue-500, bg-emerald-500, bg-amber-500
- Filter active state: border-enphase-300 bg-enphase-50/50
- Links/actions: text-enphase-500 hover:text-enphase-600 (replaces blue-600)
- Tailwind custom colors: enphase-50 through enphase-900 in tailwind.config.js

## Typography
- **Font**: Inter, 14px base body
- **Typography scale**:
  - h1: 1.5rem, semibold
  - h2: 1.125rem, semibold
  - h3: 1rem, semibold
  - h4/h5/h6: 0.875rem, semibold
- **Page headers**: text-lg (1.125rem) font-semibold, description text-[13px] text-gray-500
- **Card headings**: text-sm font-semibold text-gray-900
- **Body text**: text-sm (0.875rem), labels text-[13px]

## Layout
- **No dark mode** — light-only enterprise design
- **No glassmorphism** — clean white cards with subtle borders and shadows
- **Sidebar**: 240px wide, orange active states with bg-enphase-50/text-enphase-600/border-enphase-200
- **Header**: 48px (h-12), clean white, no search bar/theme toggle
- **Main content area**: bg-gray-50/50 background
- **Desktop-optimized**: max-w-[1400px] content container, desktop-first grid layouts (grid-cols-4/5/6 without sm: prefix), lg:p-8 padding

## Component Guidelines
- Use Radix UI primitives and shadcn/ui components
- Use Lucide icons
- Use Framer Motion for animations
- Use Recharts 3 for charts
