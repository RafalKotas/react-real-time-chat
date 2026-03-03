# 🖼️ Gallery

Component to display shared photos from `Detail` component in higher resolution (real images) and enable user to iterate through these images.

## Props:
- `setGalleryMode` (`boolean`) - enables close gallery inside this component: 
```html
<span className="gallery-close" onClick={() => setGalleryMode(false)} role="button" aria-label="Close gallery">
```
- `chatImages` (`string[]`) - array of images urls, used in:

Display images count:
```html
<h2>Gallery ({currentImage + 1} / {chatImages.length})</h2>
```

Display current image:
```html
<div className="gallery-image-container">
    <img className="gallery-image" src={chatImages[currentImage]} alt="" />
</div>
```

Disables "Next image" button if `currentImage` index is last possible (`chatImages.length - 1`):
```html
    <button className="gallery-image-navigation-icon" disabled={currentImage === chatImages.length - 1} onClick={() => handleChangeImage("right")}>
        <Tooltip label="Next image">
            <FontAwesomeIcon icon={faArrowRight} />
        </Tooltip>
    </button>
```

- `initialGalleryImageIndex`(number):

Used to display in the beginning selected image from parent component:

```typescript
const [currentImage, setCurrentImage] = useState(initialGalleryImageIndex);
```

### Usage in component's code:
```html
<h2>Gallery ({currentImage + 1} / {chatImages.length})</h2>
```

Display `currentImage`(index).

```html
    <button className="gallery-image-navigation-icon" disabled={currentImage === 0} onClick={() => handleChangeImage("left")}>
        <Tooltip label="Previous image">
            <FontAwesomeIcon icon={faArrowLeft} />
        </Tooltip>  
    </button>
```

Disable "Previous image" button if `currentImage`(index) is equal to `0` (no images earlier).

```html
    <div className="gallery-image-container">
        <img className="gallery-image" src={chatImages[currentImage]} alt="" />
    </div>
```

Display current image.

```html
    <button className="gallery-image-navigation-icon" disabled={currentImage === chatImages.length - 1} onClick={() => handleChangeImage("right")}>
        <Tooltip label="Next image">
            <FontAwesomeIcon icon={faArrowRight} />
        </Tooltip>
    </button>
```

Disable "Next image" button if `currentImage`(index) is equal to `chatImages.length - 1`

## useState variables:
- `const [currentImage, setCurrentImage] = useState(initialGalleryImageIndex);`

`currentImage` - current visible image index

### Usages:

```typescript
const handleChangeImage = (direction: "left" | "right") => {
    if (direction === "left") {
        if (currentImage !== 0) {
            setCurrentImage(currentImage - 1);
        }
    } else {
        if (currentImage !== chatImages.length - 1) {
            setCurrentImage(currentImage + 1);
        }
    }
}
```

Changes when "Previous image"(`currentImage -= 1`) or "Next image" (`currentImage += 1`) labelled buttons are clicked and conditions met.

```html
<h2>Gallery ({currentImage + 1} / {chatImages.length})</h2>
```

Display current image index inside header.

```html
<button className="gallery-image-navigation-icon" disabled={currentImage === 0} onClick={() => handleChangeImage("left")}>
    <Tooltip label="Previous image">
        <FontAwesomeIcon icon={faArrowLeft} />
    </Tooltip>  
</button>
```

Makes "Previous image" button disabled if equals to `0`.

```html
<div className="gallery-image-container">
    <img className="gallery-image" src={chatImages[currentImage]} alt="" />
</div>
```

Determines image url to display inside `"gallery-image-container"`.

```html
    <button className="gallery-image-navigation-icon" disabled={currentImage === chatImages.length - 1} onClick={() => handleChangeImage("right")}>
        <Tooltip label="Next image">
            <FontAwesomeIcon icon={faArrowRight} />
        </Tooltip>
    </button>
```

Makes "Next image" button disabled if equals to `chatImages.length - 1`.

## Components full code

```typescript
import { faArrowLeft, faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./gallery.css";
import { useState } from "react";
import Tooltip from "../../chat/customEmojiPicker/Tooltip";

const Gallery = ({setGalleryMode, chatImages, initialGalleryImageIndex}: {setGalleryMode: (galleryMode: boolean) => void, chatImages: string[], initialGalleryImageIndex: number}) => {
    
    const [currentImage, setCurrentImage] = useState(initialGalleryImageIndex);

    const handleChangeImage = (direction: "left" | "right") => {
        if (direction === "left") {
            if (currentImage !== 0) {
                setCurrentImage(currentImage - 1);
            }
        } else {
            if (currentImage !== chatImages.length - 1) {
                setCurrentImage(currentImage + 1);
            }
        }
    }
    
    return (
        <div className="gallery">
            <div className="gallery-header">
                <h2>Gallery ({currentImage + 1} / {chatImages.length})</h2>
                <span className="gallery-close" onClick={() => setGalleryMode(false)} role="button" aria-label="Close gallery">
                    <FontAwesomeIcon icon={faXmark} />
                </span>
            </div>
            <div className="gallery-content">
                <button className="gallery-image-navigation-icon" disabled={currentImage === 0} onClick={() => handleChangeImage("left")}>
                    <Tooltip label="Previous image">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Tooltip>  
                </button>
                <div className="gallery-image-container">
                    <img className="gallery-image" src={chatImages[currentImage]} alt="" />
                </div>
                <button className="gallery-image-navigation-icon" disabled={currentImage === chatImages.length - 1} onClick={() => handleChangeImage("right")}>
                    <Tooltip label="Next image">
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Tooltip>
                </button>
            </div>
        </div>
    );
};

export default Gallery;
```