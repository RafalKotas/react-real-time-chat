import { faMinus, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";

import "./chatList.css"
import AddUser from "./addUser/AddUser"

const ChatList = () => {
    
    const [addMode, setAddMode] = useState(false);

    return (
        <div className='chatList'>
            <div className="search">
                <div className="searchBar">
                    <FontAwesomeIcon icon={faSearch} />
                    <input type="text" placeholder="Search" />
                </div>
                {addMode ? (
                    <FontAwesomeIcon icon={faMinus} className="add" onClick={() => setAddMode((prev) => !prev)} />
                ) : (
                    <FontAwesomeIcon icon={faPlus} className="add" onClick={() => setAddMode((prev) => !prev)} />
                )}
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            <div className="item">
                <img src="./Letter-A-icon.png" alt="" />
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>Hello!</p>
                </div>
            </div>
            {addMode && <AddUser />}
        </div>
    )
}

export default ChatList