import "./userInfo.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faEllipsis, faVideo } from "@fortawesome/free-solid-svg-icons"
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {

    const {user: currentUser} = useUserStore();

    return (
        <div className='userInfo'>
            <div className="user">
                <img src={currentUser?.avatar || "./user.png"} alt="" />
                <h2>{currentUser?.username}</h2>
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