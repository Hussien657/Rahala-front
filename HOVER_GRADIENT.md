# Hover Gradient Background

This project includes a beautiful hover gradient background effect that transitions smoothly when hovered. The gradient goes from primary color through blue to accent color, with the middle blue color changing on hover.

## Implementation

The hover gradient background has been implemented in multiple ways to provide flexibility:

### 1. CSS Utility Classes

Two CSS utility classes have been added to `global.css`:

#### `.hover-gradient-bg`
- Full-screen gradient background with `min-h-screen`
- Perfect for page backgrounds
- Usage: `<div className="hover-gradient-bg">...</div>`

#### `.hover-gradient`
- Flexible gradient without height constraints
- Perfect for components, cards, buttons
- Usage: `<div className="hover-gradient">...</div>`

### 2. React Component

A reusable React component `HoverGradientBackground` with customizable props:

```tsx
import HoverGradientBackground from '@/components/HoverGradientBackground';

<HoverGradientBackground
  fromColor="from-primary"
  viaColor="via-blue-600"
  viaHoverColor="hover:via-blue-500"
  toColor="to-accent"
  transitionDuration="duration-500"
>
  {/* Your content */}
</HoverGradientBackground>
```

### 3. Inline Tailwind Classes

For maximum control, use Tailwind classes directly:

```tsx
<div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-accent hover:via-blue-500 transition-all duration-500 ease-in-out">
  {/* Your content */}
</div>
```

## Color Scheme

The gradient uses the following color scheme defined in your theme:

- **Primary**: `hsl(210 80% 38%)` (light) / `hsl(210 70% 48%)` (dark)
- **Blue-600**: Standard Tailwind blue-600
- **Blue-500**: Standard Tailwind blue-500 (hover state)
- **Accent**: `hsl(155 55% 43%)` (light) / `hsl(155 50% 50%)` (dark)

## Demo Pages

Visit these routes to see the hover gradient in action:

- `/gradient-demo` - Full-screen gradient background demo
- `/gradient-examples` - Various implementation examples

## Customization

### Changing Colors

You can customize the gradient colors by:

1. **Modifying CSS variables** in `global.css` for primary and accent colors
2. **Using different Tailwind colors** in the component props or inline classes
3. **Creating custom color variants** in `tailwind.config.ts`

### Changing Transition

Modify the transition duration and easing:

```tsx
// Faster transition
<div className="hover-gradient transition-all duration-300 ease-out">

// Slower transition  
<div className="hover-gradient transition-all duration-700 ease-in-out">

// Custom easing
<div className="hover-gradient transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
```

### Different Gradient Directions

Change the gradient direction:

```tsx
// Top to bottom
<div className="bg-gradient-to-b from-primary via-blue-600 to-accent hover:via-blue-500">

// Left to right
<div className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:via-blue-500">

// Diagonal (top-left to bottom-right)
<div className="bg-gradient-to-br from-primary via-blue-600 to-accent hover:via-blue-500">
```

## Browser Support

The hover gradient effect uses modern CSS features:
- CSS Gradients (supported in all modern browsers)
- CSS Transitions (supported in all modern browsers)
- CSS Custom Properties/Variables (IE 11+)

## Performance

The effect is optimized for performance:
- Uses CSS transitions instead of JavaScript animations
- Hardware-accelerated when possible
- Smooth 60fps transitions on modern devices
