import List from "./components/list/List"
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { hasToken } from "./lib/api/client";

function App() {

  const { user: currentUser, isLoading, fetchUser } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    if (hasToken()) {
      fetchUser("me");
    } else {
      fetchUser("");
    }
  }, [fetchUser]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className='container'>
      { 
        currentUser ? (
          <>
            <List/>
            {chatId && <Chat/>}
            {chatId && <Detail/>}
          </>
        ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App
