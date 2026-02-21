import "./chat.css"

import { faCamera, faImage, faInfoCircle, faMicrophone, faPhone, faSmile, faVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useEffect, useState } from "react"
import CustomEmojiPicker from "./customEmojiPicker/CustomEmojiPicker"

const Chat = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [message, setMessage] = useState("");

    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const handleEmojiClick = (emoji: string) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./Letter-A-icon.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <FontAwesomeIcon icon={faPhone} />
                    <FontAwesomeIcon icon={faVideo} />
                    <FontAwesomeIcon icon={faInfoCircle} />
                </div>
            </div>
            
            <div className="center">
                <div className="message mine">
                    <div className="texts">
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message">
                    <img src="./Letter-A-icon.png" alt="" />
                    <div className="texts">
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message mine">
                    <div className="texts">
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message">
                    <img src="./Letter-A-icon.png" alt="" />
                    <div className="texts">
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message mine">
                    <div className="texts">
                        <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
                        </p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div ref={endRef} />
            </div>

            <div className="bottom">
                <div className="icons">
                    <FontAwesomeIcon icon={faImage} />
                    <FontAwesomeIcon icon={faCamera} />
                    <FontAwesomeIcon icon={faMicrophone} />
                </div>

                <input 
                    type="text" 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <div className="emoji" style={{ position: "relative" }}>
                    <FontAwesomeIcon 
                        icon={faSmile}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    />
                    {showEmojiPicker && (
                        <CustomEmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji as string)} />
                    )}
                </div>

                <button className="sendButton">Send</button>
            </div>
        </div>
    )
}

export default Chat