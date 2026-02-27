# Theme System Documentation

## Overview
BuKe now supports light/dark theme switching with system preference detection, inspired by modern design patterns.

## Features
- **Light Mode**: Clean, cream-based palette perfect for daytime use
- **Dark Mode**: Rich, warm dark theme with reduced eye strain
- **System Mode**: Automatically follows your device's theme preference
- **Smooth Transitions**: Elegant color transitions when switching themes
- **Persistent**: Theme preference is saved to localStorage

## Theme Toggle Locations
1. **Provider Dashboard** (`/dashboard/[slug]`)
   - Located in the top header, next to the notification bell
   - Accessible to service providers managing their bookings

2. **Customer Booking Page** (`/[slug]/book`)
   - Located in the top-right corner
   - Accessible to customers booking appointments

## Technical Implementation

### Components
- `components/ThemeProvider.tsx` - Context provider managing theme state
- `components/ThemeToggle.tsx` - UI toggle component with three buttons (light/dark/system)

### Theme Variables (CSS)
All colors use HSL format for smooth transitions:

#### Light Theme
- Background: `0 0% 96%` (soft cream)
- Foreground: `0 0% 9%` (dark text)
- Gold: `40 65% 50%` (warm accent)
- Cream: `38 50% 96%` (light hover state)
- Cream Dark: `38 40% 88%` (subtle borders)
- Border: `0 0% 83%` (subtle dividers)

#### Dark Theme
- Background: `30 10% 12%` (rich dark brown)
- Foreground: `0 0% 95%` (light text)
- Gold: `40 70% 55%` (brighter accent)
- Cream: `30 15% 18%` (dark hover state)
- Cream Dark: `30 12% 22%` (subtle dark borders)
- Border: `30 8% 22%` (subtle dark dividers)

### Usage in Components
The theme automatically applies to all components using Tailwind utility classes:

```tsx
// Use semantic color names
<div className="bg-background text-foreground">
  <button className="bg-gold hover:bg-gold-dark">
    Click me
  </button>
</div>
```

### Color Classes Available
- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-gold` / `bg-gold-light` / `bg-gold-dark`
- `bg-cream` / `bg-cream-dark`
- `bg-ink` / `text-ink` / `text-ink-light`
- `border-border`
- `text-muted` / `text-muted-foreground`

### Component Integration

#### Calendar Component
The booking calendar (`components/booking/CalendarPicker.tsx`) uses theme variables for all colors:
- Selected dates: `hsl(var(--gold))`
- Hover states: `hsl(var(--cream))`
- Text colors: `hsl(var(--foreground))`
- Disabled dates: `hsl(var(--muted))`

Custom calendar styles are defined in `components/booking/calendar-styles.css` and automatically adapt to theme changes.

## How It Works

1. **Theme Selection**
   - User clicks one of three buttons: Sun (light), Moon (dark), Monitor (system)
   - Selection is saved to localStorage as `theme: 'light' | 'dark' | 'system'`

2. **Theme Application**
   - ThemeProvider adds `.light` or `.dark` class to `<html>` element
   - CSS variables are updated based on the active theme
   - All components using theme variables automatically update

3. **System Preference**
   - When "system" mode is selected, the app listens to `prefers-color-scheme` media query
   - Theme automatically updates when user changes their system preference
   - No page reload required

## Transitions
Smooth 0.2s transitions are applied to:
- Background colors
- Text colors
- Border colors
- Fill/stroke (for SVG icons)

## Browser Support
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Falls back gracefully in older browsers
- Uses CSS custom properties (CSS variables)

## Future Enhancements
- [ ] Add theme-specific images/illustrations
- [ ] Add more theme presets (e.g., "high contrast", "sepia")
- [ ] Add color customization options for providers
- [ ] Add schedule-based auto-switching (e.g., dark mode at night)
- [ ] Add animation preferences (respect prefers-reduced-motion)

## Technical Details

### CSS Variables Location
All theme variables are defined in `app/globals.css`:
```css
:root {
  --background: 0 0% 96%;
  --cream-dark: 38 40% 88%;
  /* ... */
}

.dark {
  --background: 30 10% 12%;
  --cream-dark: 30 12% 22%;
  /* ... */
}
```

### Tailwind Configuration
Theme colors are mapped in `tailwind.config.js`:
```javascript
colors: {
  cream: {
    DEFAULT: 'hsl(var(--cream))',
    dark: 'hsl(var(--cream-dark))',
  },
  // ...
}
```

## References
- Implementation inspired by: https://javascript.plainenglish.io/how-to-make-a-system-light-dark-theme-selector-4e70322205d7
- Uses Next.js 14 App Router patterns
- Follows React best practices for context providers
