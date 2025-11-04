# Contributing to Eventix

Thank you for your interest in contributing to Eventix! This document provides guidelines and instructions for contributing.

---

## 🎯 Getting Started

### Prerequisites
- Node.js 18 or higher
- Git
- Azure CLI (for cloud deployment)
- VS Code (recommended)

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/frzxw/eventix.git
cd eventix

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.development

# Start development server
npm run dev
```

### Development Commands

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check code quality
npm run lint

# Format code
npm run format

# Run tests (when available)
npm run test
```

---

## 📝 Code Standards

### TypeScript
- Use **strict mode** - enabled by default
- Avoid `any` type - use proper typing
- Prefer `interface` over `type` for object shapes
- Export types from type modules

### Naming Conventions
```typescript
// Components: PascalCase
export function EventCard() { }

// Functions/Variables: camelCase
const getUserEvents = () => { }

// Constants: UPPER_SNAKE_CASE
const MAX_EVENTS = 100

// CSS Classes: kebab-case (via Tailwind)
className="event-card-container"
```

### React Components
```typescript
// Always export as named export
export function MyComponent() {
  return <div>Component</div>
}

// Use functional components and hooks
import { useState } from 'react'

// Prefer composition over prop drilling
<Parent>
  <Child />
</Parent>
```

### Styling
```typescript
// ✅ DO - Use design tokens from globals.css
<div className="text-[var(--text-primary)]">Text</div>

// ❌ DON'T - Hardcode colors
<div className="text-black">Text</div>

// ✅ DO - Use Tailwind classes
<button className="bg-primary hover:bg-primary/90">Button</button>

// ❌ DON'T - Use inline styles
<button style={{ backgroundColor: 'blue' }}>Button</button>
```

---

## 📦 File Structure

```
eventix/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── common/         # Reusable molecules
│   │   ├── events/         # Event-specific organisms
│   │   └── ...
│   ├── pages/              # Page components
│   ├── lib/
│   │   ├── services/       # API, Storage, etc.
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils.ts        # Utility functions
│   │   ├── constants.ts    # App constants
│   │   └── types.ts        # TypeScript types
│   ├── styles/             # Global CSS
│   └── App.tsx
├── azure/                  # Azure configuration
│   ├── infrastructure/     # Bicep IaC
│   └── functions/          # Azure Functions
├── docs/                   # Documentation
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   └── copilot-instructions.md
└── ...
```

---

## 🔄 Git Workflow

### Branch Naming
```
feature/description       # New feature
fix/description          # Bug fix
docs/description         # Documentation
refactor/description     # Code refactoring
test/description         # Tests
chore/description        # Maintenance
```

### Commit Messages
```
feat: add event search functionality
fix: resolve date picker timezone issue
docs: update deployment guide
refactor: simplify authentication flow
test: add unit tests for EventCard
chore: update dependencies
```

### Pull Request Process

1. **Fork and create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

4. **PR Checklist**
   - [ ] Code follows style guidelines
   - [ ] All tests pass
   - [ ] Documentation updated
   - [ ] No breaking changes
   - [ ] Linked to related issues

---

## ✅ Before Submitting

### Code Quality

```bash
# Format code
npm run format

# Check for lint errors
npm run lint

# Build project
npm run build

# No errors? You're ready!
```

### Testing

```bash
# Run tests
npm run test

# Check test coverage
npm run test:coverage
```

### Documentation

- Update README.md if adding features
- Add JSDoc comments to complex functions
- Update type definitions
- Include examples for new APIs

---

## 🐛 Reporting Issues

### Bug Report Template
```
## Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 10
- Browser: Chrome 90
- Node: 18.0.0

## Screenshots/Logs
If applicable, add screenshots or logs
```

### Feature Request Template
```
## Description
What would you like?

## Use Case
Why do you need this?

## Proposed Solution
How should it work?

## Alternatives
Other solutions considered?
```

---

## 🚀 Development Tips

### Component Development

```typescript
// 1. Create component file
// src/components/MyComponent.tsx

import { FC } from 'react'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export const MyComponent: FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="...">
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  )
}

// 2. Export from barrel file
// src/components/index.ts
export { MyComponent } from './MyComponent'

// 3. Use in another component
import { MyComponent } from '@/components'

export function App() {
  return <MyComponent title="Hello" onAction={() => {}} />
}
```

### Service Integration

```typescript
// src/lib/services/my-service.ts
import { logger } from './logger'

export class MyService {
  async fetchData() {
    try {
      const response = await fetch('/api/data')
      return await response.json()
    } catch (error) {
      logger.error('Failed to fetch data', { error })
      throw error
    }
  }
}

export const myService = new MyService()
```

### Adding Hooks

```typescript
// src/lib/hooks/useMyHook.ts
import { useEffect, useState } from 'react'

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    }
  }, [])

  return { value, setValue }
}

// Usage
import { useMyHook } from '@/lib/hooks'

export function MyComponent() {
  const { value, setValue } = useMyHook('default')
  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

---

## 📚 Architecture Guidelines

### Atomic Design
Components follow atomic design principles:

```
atoms           # Small reusable units (Button, Input, Label)
  ↓
molecules       # Combination of atoms (SearchBar, Card)
  ↓
organisms       # Combination of molecules (EventCard, Header)
  ↓
templates       # Page templates (EventLayout)
  ↓
pages           # Full pages (EventDetailPage)
```

### Service Layer Pattern
```typescript
// Always encapsulate external calls in services
// ❌ Bad: fetch directly in component
function MyComponent() {
  useEffect(() => {
    fetch('/api/events').then(r => r.json())
  }, [])
}

// ✅ Good: use service
function MyComponent() {
  useEffect(() => {
    azureApi.getEvents()
  }, [])
}
```

---

## 🔐 Security Guidelines

1. **Never commit secrets**
   - Use `.env` files (not committed)
   - Store in Azure Key Vault (production)
   - Reference in environment variables

2. **Validate inputs**
   - Client-side with Zod
   - Server-side always
   - Never trust user input

3. **Protect sensitive operations**
   - Use JWT tokens
   - Implement CSRF protection
   - Use HTTPS only
   - Set appropriate CORS headers

4. **Audit logging**
   - Log important actions
   - Track user activities
   - Monitor error rates

---

## 📖 Documentation Standards

### Component Documentation
```typescript
/**
 * Event Card Component
 * 
 * Displays a single event with image, title, date, and ticket info.
 * Used in event lists and carousels.
 * 
 * @example
 * <EventCard event={event} onClick={handleClick} />
 * 
 * @param event - The event object to display
 * @param onClick - Callback when card is clicked
 */
export function EventCard({ event, onClick }: Props) { }
```

### Function Documentation
```typescript
/**
 * Formats a date string to readable format
 * @param date - ISO date string
 * @param locale - Locale code (default: 'id-ID')
 * @returns Formatted date string
 * @example
 * formatDate('2025-01-01') // 'Rabu, 1 Januari 2025'
 */
export function formatDate(date: string, locale = 'id-ID'): string { }
```

---

## 🎓 Resources

### Eventix Specific
- [Project Architecture](../docs/architecture/)
- [Development Guide](../docs/development/)
- [COPILOT Instructions](./.github/copilot-instructions.md)

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Azure Documentation](https://docs.microsoft.com/azure/)

---

## 💬 Getting Help

- **Documentation:** Check `docs/` folder
- **Issues:** Search existing GitHub issues
- **Discussions:** Use GitHub Discussions
- **Email:** support@eventix.id

---

## 📋 Code Review Checklist

Before submitting your PR, ensure:

- [ ] Code follows style guidelines
- [ ] All lint checks pass
- [ ] Build succeeds without errors
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] No console errors in development
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Performance is acceptable
- [ ] No breaking changes

---

## 🎉 Thank You!

Your contributions help make Eventix better. We appreciate your effort and look forward to working with you!

---

**Last Updated:** November 4, 2025  
**Maintained By:** Eventix Development Team
