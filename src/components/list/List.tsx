import "./list.css";

import ChatList from "@components/list/chatList/ChatList";
import UserInfo from "@components/list/userInfo/Userinfo";

const List = () => {
    return (
        <div className='list'>
            <UserInfo/>
            <ChatList/>
        </div>
    )
}

export default List










