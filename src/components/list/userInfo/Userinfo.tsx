import { faArrowRightFromBracket, faEdit, faEllipsis, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./userInfo.css";

import { logout } from "@lib/api/auth";
import { useChatStore } from "@lib/chatStore";
import { useUserStore } from "@lib/userStore";

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
                <FontAwesomeIcon className="feature-to-implement" icon={faEllipsis} />
                <FontAwesomeIcon className="feature-to-implement" icon={faVideo} />
                <FontAwesomeIcon className="feature-to-implement" icon={faEdit} />
            </div>
            {chatId == null && <button className="logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
            </button>}
        </div>
    )
}

export default Userinfo