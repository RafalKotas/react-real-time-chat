import "./detail.css"
import { faArrowRightFromBracket, faArrowUp, faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const Detail = () => {
    return (
        <div className='detail'>
            <div className="user">
                <img src="./Letter-A-icon.png" alt="" />
                <h2>Jane Doe</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared photos</span>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://images.pexels.com/photos/35065724/pexels-photo-35065724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                <span>boat-example-image.jpg</span>
                            </div>
                            <FontAwesomeIcon icon={faDownload} className="download" />
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                </div>
                <button>Block User</button>
                <button className="logout">
                    <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
                </button>
            </div>
        </div>
    )
}

export default Detail





