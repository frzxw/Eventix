# Package Reference

This document lists all the npm packages used in the Eventix project and their purposes.

## Core Dependencies

### React & TypeScript
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```
- **react**: Core React library for building the UI
- **react-dom**: React renderer for web browsers
- **typescript**: Type-safe JavaScript superset

### Styling
```json
{
  "tailwindcss": "^4.0.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```
- **tailwindcss**: Utility-first CSS framework (v4.0 with native CSS variables)
- **clsx**: Utility for conditionally joining classNames
- **tailwind-merge**: Merge Tailwind CSS classes without conflicts

### UI Components
```json
{
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slider": "^1.1.2",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7"
}
```
- Radix UI provides accessible, unstyled component primitives
- Used as foundation for shadcn/ui components

### Icons
```json
{
  "lucide-react": "^0.300.0"
}
```
- **lucide-react**: Beautiful, consistent icon library

### Forms
```json
{
  "react-hook-form": "^7.55.0"
}
```
- **react-hook-form**: Performant, flexible forms with easy validation

### Notifications
```json
{
  "sonner": "^2.0.3"
}
```
- **sonner**: Toast notification library

## Development Dependencies

### Build Tools
```json
{
  "@vitejs/plugin-react": "^4.0.0",
  "vite": "^5.0.0"
}
```
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite

### TypeScript Types
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "^20.0.0"
}
```
- Type definitions for React, ReactDOM, and Node.js

### Linting & Formatting
```json
{
  "eslint": "^8.50.0",
  "eslint-plugin-react": "^7.33.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```
- **eslint**: JavaScript linter
- **prettier**: Code formatter
- Plugins for React and TypeScript support

### PostCSS (for Tailwind)
```json
{
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```
- **postcss**: CSS transformation tool
- **autoprefixer**: Add vendor prefixes automatically

## Optional Enhancement Packages

### Testing
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "vitest": "^1.0.0",
  "jsdom": "^23.0.0"
}
```

### Analytics
```json
{
  "react-ga4": "^2.1.0",
  "mixpanel-browser": "^2.48.0"
}
```

### Error Tracking
```json
{
  "@sentry/react": "^7.80.0"
}
```

### Internationalization
```json
{
  "react-i18next": "^13.5.0",
  "i18next": "^23.7.0"
}
```

### Charts (for analytics dashboard)
```json
{
  "recharts": "^2.10.0"
}
```

### Date Handling
```json
{
  "date-fns": "^3.0.0"
}
```

### State Management (if needed)
```json
{
  "zustand": "^4.4.0"
}
```

## Installation Commands

### Install all core dependencies
```bash
npm install react react-dom \
  tailwindcss clsx tailwind-merge \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar @radix-ui/react-checkbox \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-radio-group @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-slot @radix-ui/react-switch \
  @radix-ui/react-tabs @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  lucide-react react-hook-form@7.55.0 sonner@2.0.3
```

### Install dev dependencies
```bash
npm install -D typescript @types/react @types/react-dom \
  @types/node vite @vitejs/plugin-react \
  eslint prettier autoprefixer postcss
```

## Scripts Reference

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Version Locking

For production, consider using exact versions:

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

Or use `npm ci` in CI/CD to install exact versions from `package-lock.json`.

## Updates

To check for updates:
```bash
npm outdated
```

To update packages:
```bash
npm update
```

For major version updates, use:
```bash
npx npm-check-updates -u
npm install
```

## Notes

1. **Tailwind v4.0**: Uses native CSS variables instead of `tailwind.config.js`
2. **React Hook Form**: Import with version `react-hook-form@7.55.0` as specified in project requirements
3. **Sonner**: Import toast with `sonner@2.0.3` for version-specific features
4. All shadcn/ui components are already included in the project and don't need separate installation
