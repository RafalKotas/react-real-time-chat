# Notification

Very simple component just to display `ToastContainer` from `react-toastify` library.

## Component file content

```javascript
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Notification = () => {
    return (
        <div className="notification">
            <ToastContainer position="bottom-right"/>
        </div>
    )
}

export default Notification;
```

### `ToastContainer` component used props:
- `position` - position on screen where toast should appear (`'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'`)