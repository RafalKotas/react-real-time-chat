import "./list.css"
import UserInfo from "@components/list/userInfo/Userinfo"
import ChatList from "@components/list/chatList/ChatList"

const List = () => {
    return (
        <div className='list'>
            <UserInfo/>
            <ChatList/>
        </div>
    )
}

export default List










