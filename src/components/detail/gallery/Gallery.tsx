import { useState } from "react";
import { faArrowLeft, faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./gallery.css";

import Tooltip from "@components/chat/customEmojiPicker/Tooltip";

const Gallery = ({setGalleryMode, chatImages, initialGalleryImageIndex}: {setGalleryMode: (galleryMode: boolean) => void, chatImages: string[], initialGalleryImageIndex: number}) => {
    
    const [currentImage, setCurrentImage] = useState(initialGalleryImageIndex);

    const handleChangeImage = (direction: "left" | "right") => {
        if (direction === "left" && currentImage !== 0) {
            setCurrentImage(currentImage - 1);
        } else if (direction === "right" && currentImage !== chatImages.length - 1) {
            setCurrentImage(currentImage + 1);
        }
    }
    
    return (
        <div className="gallery">
            <div className="gallery-header">
                <h2>Gallery ({currentImage + 1} / {chatImages.length})</h2>
                <button
                    type="button"
                    className="gallery-close"
                    onClick={() => setGalleryMode(false)}
                    aria-label="Close gallery"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
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