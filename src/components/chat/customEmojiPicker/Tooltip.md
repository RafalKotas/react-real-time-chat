# Tooltip

Component that shows a small text label above an element when the user hovers over it. Used in the emoji picker to show the emoji name (e.g. "grinning face") on hover.

## Props (`TooltipProps`)

`children` – single React element that the user hovers over (the “trigger”). The tooltip appears when the mouse is over this element.

`label` – text shown inside the tooltip (e.g. CLDR short name like "grinning face"). Optional; if missing, `"Emoji"` is used.

## Refs and state

`triggerRef` – ref to the wrapper div around `children`. Used to read the element’s position on the page (`getBoundingClientRect`).

`isHovered` – whether the mouse is currently over the trigger. When `true`, the tooltip is shown.

`rect` – last measured position and size of the trigger (`DOMRect`: left, top, width, height). Used to place the tooltip above the trigger.

## Behaviour

### When hover starts (`handleMouseEnter`)

1. Read the trigger’s position with `getBoundingClientRect()` and save it in `rect`.
2. Set `isHovered` to `true` so the tooltip is rendered.

### When hover ends (`handleMouseLeave`)

1. Set `isHovered` to `false` and `rect` to `null` so the tooltip is hidden.

### Keeping the tooltip position in sync (`useEffect`)

While `isHovered` is `true`, the effect runs a loop using `requestAnimationFrame` that:

1. Reads the trigger’s current `getBoundingClientRect()`.
2. Updates `rect` only if the position or size changed (to avoid unnecessary re-renders).
3. Schedules the next frame.

When the user scrolls or the layout moves, the tooltip stays above the trigger. The effect cleans up by cancelling the animation frame when hover ends or the component unmounts.

### Tooltip content and position

When `isHovered` and `rect` are set, the tooltip is rendered as a div with:

- **Position:** centered above the trigger: `left = rect.left + rect.width / 2`, `top = rect.top`, with `transform: translate(-50%, calc(-100% - 8px))` so it sits 8px above the trigger and is horizontally centered.
- **Text:** `label` if provided, otherwise `"Emoji"`.

### Rendering (portal)

The component returns:

1. A wrapper div (`.tooltip-container`) that holds the trigger.
2. A div (`.tooltip-children`) with `ref={triggerRef}` and `onMouseEnter` / `onMouseLeave`, wrapping `children`.
3. The tooltip content is not rendered inside this tree. It is rendered into `document.body` via `createPortal(tooltipContent, document.body)` so it is not clipped by overflow or stacking context of the emoji picker.

The tooltip is only rendered when `isHovered`, `rect` is set, and `document` is defined (so it works with SSR).
