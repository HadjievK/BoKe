# Calendar Integration Documentation

## Overview
BuKe uses `react-day-picker` (v9+) for a professional, accessible calendar experience. This replaced the custom 7-day grid with a full month view.

## Why React-Day-Picker?

### Previous Solution: Custom Calendar
- ❌ Limited 7-day view requiring manual navigation
- ❌ Custom date logic prone to bugs
- ❌ No built-in accessibility features
- ❌ More code to maintain
- ❌ Missing keyboard navigation
- ❌ Hard-coded theme colors

### New Solution: React-Day-Picker
- ✅ Full month calendar view
- ✅ Built-in accessibility (ARIA labels, screen reader support)
- ✅ Keyboard navigation (arrow keys, Enter to select)
- ✅ MIT licensed, well-maintained library
- ✅ Theme-integrated styling
- ✅ Less custom code to maintain
- ✅ Professional UX

## Implementation

### Installation
```bash
npm install react-day-picker
```

### Component Structure

**File**: `components/booking/CalendarPicker.tsx`

```tsx
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import './calendar-styles.css'

// Component maintains same props interface for backward compatibility
interface CalendarPickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  disabledDates?: string[]
}
```

### Configuration

#### Disabled Dates
Two types of dates are disabled:
1. **Past dates** - Cannot book appointments in the past
2. **Unavailable dates** - Dates with no available time slots (from API)

```tsx
const disabledDays = [
  { before: today },           // Disable all past dates
  ...disabledDateObjects       // Disable dates from API
]
```

#### Date Range
- **From**: Today
- **To**: 2 months ahead
- Prevents booking too far in advance

```tsx
const twoMonthsAhead = new Date()
twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2)

<DayPicker
  fromDate={today}
  toDate={twoMonthsAhead}
/>
```

## Theme Integration

### Custom Styles
**File**: `components/booking/calendar-styles.css`

All calendar styles use CSS custom properties from the theme system:

```css
.rdp-day_selected {
  background: hsl(var(--gold)) !important;
  color: hsl(var(--background)) !important;
}

.rdp-day:hover {
  background: hsl(var(--cream));
  border-color: hsl(var(--gold));
}
```

### Color System
- **Selected date**: Gold background, dark text
- **Hover state**: Cream background, gold border
- **Today**: Cream background, bold text
- **Disabled**: Muted color, 40% opacity
- **Navigation buttons**: Card background on hover

### Dark Mode Support
All colors automatically adapt to dark/light theme via CSS variables:
- Light mode: Soft cream backgrounds, warm gold accents
- Dark mode: Rich dark backgrounds, brighter gold accents

## Accessibility Features

### Keyboard Navigation
- **Tab**: Focus calendar
- **Arrow keys**: Navigate between dates
- **Enter**: Select focused date
- **Page Up/Down**: Navigate months
- **Home/End**: Jump to first/last day of week

### Screen Reader Support
- ARIA labels on all interactive elements
- Announces selected date
- Announces disabled dates
- Month/year context provided

### Visual Indicators
- Focus visible outline on keyboard navigation
- Clear disabled state styling
- High contrast ratios for text

## Responsive Design

### Desktop (>640px)
- Cell size: 48px × 48px
- Font size: 0.9375rem (15px)
- Caption: 1.125rem (18px)

### Mobile (≤640px)
- Cell size: 42px × 42px
- Font size: 0.875rem (14px)
- Caption: 1rem (16px)
- Reduced padding for better fit

## API Integration

### Usage in Booking Flow

1. **User selects date** → Calendar calls `onDateSelect(date)`
2. **Parent component** → Formats date with `formatDateISO(date)`
3. **API call** → `GET /api/{slug}/availability?date=2026-03-28&service_id=0`
4. **Response** → Time slots displayed below calendar

### Date Format
Calendar works with JavaScript `Date` objects internally, but API expects ISO format:

```tsx
const handleDateSelect = (date: Date) => {
  setSelectedDate(date)
  const dateStr = formatDateISO(date) // "2026-03-28"
  fetchAvailability(dateStr)
}
```

## Customization Options

### Available DayPicker Props
```tsx
<DayPicker
  mode="single"              // Single date selection
  selected={selectedDate}    // Currently selected date
  onSelect={handleSelect}    // Selection callback
  disabled={disabledDays}    // Array of disabled dates/matchers
  fromDate={today}           // Minimum selectable date
  toDate={twoMonthsAhead}    // Maximum selectable date
  showOutsideDays            // Show dates from adjacent months
  fixedWeeks                 // Keep 6 weeks visible (no jumping)
/>
```

### Additional Features (Not Implemented)
- `showWeekNumber` - Display week numbers
- `locale` - Localization (requires date-fns locale)
- `multiple` - Allow multiple date selection
- `range` - Date range selection
- `footer` - Custom footer content

## CSS Classes Reference

### Main Container
- `.rdp` - Root container

### Navigation
- `.rdp-nav` - Navigation container
- `.rdp-nav_button` - Prev/next month buttons
- `.rdp-caption` - Month/year header

### Calendar Grid
- `.rdp-table` - Calendar table
- `.rdp-head_cell` - Weekday header cells
- `.rdp-cell` - Date cell container
- `.rdp-day` - Individual date button

### Date States
- `.rdp-day_selected` - Selected date
- `.rdp-day_disabled` - Disabled date
- `.rdp-day_today` - Current date
- `.rdp-day_outside` - Dates from adjacent months

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support
- IE11: Not supported (Next.js 14 requirement)

## Performance
- Bundle size: ~20KB (minified + gzipped)
- No impact on initial page load (code-split with Next.js)
- Renders instantly with React 18
- No external dependencies beyond date manipulation

## Maintenance

### Updating React-Day-Picker
```bash
npm update react-day-picker
```

Check for breaking changes in: https://react-day-picker.js.org/guides/upgrading

### Custom Styling
All custom styles are in `components/booking/calendar-styles.css`. Update this file to modify calendar appearance.

### Theme Variables
Calendar automatically picks up changes to theme variables in `app/globals.css`:
- `--gold` - Selection color
- `--cream` - Hover color
- `--background` - Background
- `--foreground` - Text color
- `--muted` - Disabled text

## Testing Checklist

- [ ] Calendar displays full month view
- [ ] Past dates are disabled
- [ ] Today's date is highlighted
- [ ] Date selection works
- [ ] Month navigation works
- [ ] Theme switching updates colors
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] Screen reader announces dates
- [ ] API integration works (time slots load)

## Migration Notes

### Breaking Changes from Custom Calendar
None! The component maintains the same props interface:
- `selectedDate: Date | null`
- `onDateSelect: (date: Date) => void`
- `disabledDates?: string[]`

Existing integration in `app/[slug]/book/page.tsx` works without modifications.

### Removed Features
- Week navigation buttons (replaced with month navigation)
- 7-day grid view (replaced with full month)
- Custom date range logic (handled by react-day-picker)

### Added Features
- Full month calendar view
- Keyboard navigation
- ARIA labels and screen reader support
- Better mobile responsiveness
- Professional month navigation

## References
- React-Day-Picker Docs: https://react-day-picker.js.org
- GitHub Repository: https://github.com/gpbl/react-day-picker
- License: MIT
- Version: 9.0+
