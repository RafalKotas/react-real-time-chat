import "./userInfo.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faEllipsis, faVideo } from "@fortawesome/free-solid-svg-icons"

const Userinfo = () => {
    return (
        <div className='userInfo'>
            <div className="user">
                <img src="./Letter-A-icon.png" alt="" />
                <h2>John Doe</h2>
            </div>
            <div className="icons">
                <FontAwesomeIcon icon={faEllipsis} />
                <FontAwesomeIcon icon={faVideo} />
                <FontAwesomeIcon icon={faEdit} />
            </div>
        </div>
    )
}

export default Userinfo