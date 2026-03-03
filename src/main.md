# main component

## imports

`import { StrictMode } from 'react'` - React wrapper, helps spot unsafe patterns

`import { createRoot } from 'react-dom/client'` - The API that connects React 18 to the browser. You pass it a DOM node and it returns and object with a `render()` method to render app into that node.

`import App from './App.tsx'` - React root component.

`import "./index.css"` - global CSS file, loaded once when app starts

## Mounting the app
```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `document.getElementById('root')` – The DOM element (usually a `<div id="root">` in `index.html`) where the app will live.
- `!` – TypeScript non-null assertion: you’re telling the compiler this element is not null (Vite/React templates guarantee that element exists).
- `createRoot(...).render(...)` – Creates the React root for that DOM node and renders the tree you pass.
- `<StrictMode><App /></StrictMode>` – What gets rendered: your whole app wrapped in StrictMode.