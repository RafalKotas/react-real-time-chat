import "./userInfo.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faEllipsis, faVideo, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { useUserStore } from "@lib/userStore";
import { useChatStore } from "@lib/chatStore";
import { logout } from "@lib/api/auth";

const Userinfo = () => {

    const {user: currentUser} = useUserStore();
    const { chatId } = useChatStore();

    const handleLogout = () => {
        logout();
        useUserStore.setState({ user: null });
        useChatStore.getState().resetChat();
    };

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
            {chatId == null && <button className="logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
            </button>}
        </div>
    )
}

export default Userinfo