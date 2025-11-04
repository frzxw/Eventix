# Contributing to Eventix

Thank you for your interest in contributing to Eventix! This document provides guidelines and instructions for contributing to the project.

## 🎯 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventix.git
   cd eventix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📁 Project Structure

Understanding the project structure is crucial for making effective contributions:

```
/lib/               # Core business logic, types, and utilities
  ├── tokens.ts     # Design system tokens (colors, spacing, etc.)
  ├── types.ts      # TypeScript type definitions
  ├── utils.ts      # Utility functions
  ├── constants.ts  # Application constants
  ├── mock-data.ts  # Mock data for development
  └── seo.ts        # SEO helpers

/components/        # React components
  ├── layout/       # Layout components (Header, Footer)
  ├── home/         # Homepage components
  ├── events/       # Event-related components
  ├── booking/      # Booking flow components
  ├── checkout/     # Checkout flow components
  └── tickets/      # Ticket display components

/styles/            # Global styles and CSS
  └── globals.css   # Tailwind config and custom styles
```

## 🎨 Design System

### Token-Based Design

Eventix uses a comprehensive token system. **Never use hardcoded values** for:
- Colors
- Spacing
- Typography
- Border radius
- Shadows
- Animation durations

#### Correct ✅
```tsx
<div className="p-6 rounded-xl bg-[var(--surface-glass)]">
```

#### Incorrect ❌
```tsx
<div className="p-6 rounded-xl bg-gray-800">
```

### Adding New Tokens

1. Add to `/lib/tokens.ts`:
   ```typescript
   export const tokens = {
     colors: {
       light: {
         // Add new token
         highlight: { DEFAULT: '#ff6b6b' }
       }
     }
   }
   ```

2. Add to `/styles/globals.css`:
   ```css
   :root {
     --highlight: #ff6b6b;
   }
   ```

3. Use in components:
   ```tsx
   <div className="bg-[var(--highlight)]">
   ```

## 🧩 Component Guidelines

### Component Structure

Follow this structure for new components:

```tsx
import { ComponentProps } from './types'; // Import types first
import { OtherComponents } from './components'; // Then components
import { utilities } from './utils'; // Then utilities

interface MyComponentProps {
  // Props interface
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  // State and hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="glass rounded-2xl border border-[var(--border-glass)] p-6">
      {/* Component JSX */}
    </div>
  );
}
```

### Accessibility Requirements

Every component must:
- Use semantic HTML elements
- Include ARIA labels where needed
- Support keyboard navigation
- Have visible focus indicators
- Meet WCAG 2.1 AA contrast ratios

#### Example: Accessible Button
```tsx
<button
  onClick={handleClick}
  className="focus-ring transition-smooth"
  aria-label="Descriptive label"
  disabled={isDisabled}
>
  Button Text
</button>
```

### TypeScript Guidelines

- Always define prop interfaces
- Use type imports from `/lib/types.ts`
- Avoid `any` type
- Use const assertions for readonly data

```tsx
// Good
interface Props {
  event: Event;
  onSelect: (id: string) => void;
}

// Avoid
interface Props {
  event: any;
  onSelect: Function;
}
```

## 🎯 Code Style

### Naming Conventions

- **Components**: PascalCase (`EventCard`, `CheckoutFlow`)
- **Functions**: camelCase (`handleClick`, `formatCurrency`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_TICKETS`, `API_URL`)
- **CSS Classes**: Use Tailwind utilities, tokens for custom values

### File Naming

- **Components**: PascalCase (`EventCard.tsx`)
- **Utilities**: camelCase (`utils.ts`, `seo.ts`)
- **Types**: camelCase (`types.ts`)

### Import Order

1. React and external libraries
2. Component imports
3. Type imports
4. Utility imports
5. Asset imports

```tsx
import { useState } from 'react';
import { Button } from './components/ui/button';
import type { Event } from './lib/types';
import { formatCurrency } from './lib/utils';
```

## 🧪 Testing

### Adding Tests

Tests should be added for:
- Utility functions
- Complex business logic
- Form validation
- Calculation functions (pricing, availability)

```typescript
// Example test
import { calculateAvailability } from './utils';

describe('calculateAvailability', () => {
  it('calculates percentage correctly', () => {
    expect(calculateAvailability(50, 100)).toBe(50);
  });

  it('returns 0 when total is 0', () => {
    expect(calculateAvailability(0, 0)).toBe(0);
  });
});
```

## 🔧 Making Changes

### Branch Naming

- `feature/` - New features (`feature/seat-selection`)
- `fix/` - Bug fixes (`fix/checkout-validation`)
- `docs/` - Documentation (`docs/update-readme`)
- `refactor/` - Code refactoring (`refactor/event-card`)

### Commit Messages

Follow the conventional commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(checkout): add promo code validation
fix(event-card): correct availability calculation
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test your changes**
   - Verify in browser
   - Test accessibility (keyboard navigation, screen reader)
   - Check responsive design
   - Verify no console errors

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide clear description
   - Reference any related issues
   - Add screenshots for UI changes
   - Request review

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Screenshots
(if applicable)

## Related Issues
Fixes #123
```

## 🐛 Bug Reports

When reporting bugs, include:
1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, screen size
6. **Screenshots**: If applicable

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment**
- Browser: Chrome 120
- OS: macOS 14
- Screen Size: 1920x1080
```

## 💡 Feature Requests

When requesting features:
1. **Use Case**: Describe the problem it solves
2. **Proposed Solution**: Your suggested implementation
3. **Alternatives**: Other solutions you considered
4. **Additional Context**: Any other relevant information

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Design & Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)

## ❓ Questions?

If you have questions:
- Check existing issues and pull requests
- Read the documentation
- Ask in discussions
- Contact: dev@eventix.example.com

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

Thank you for contributing to Eventix! 🎉
