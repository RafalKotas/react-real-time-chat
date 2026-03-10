import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

import { hasToken } from "@lib/api/client";
import { useChatStore } from "@lib/chatStore";
import { PollProvider } from "@lib/pollContext";
import { useUserStore } from "@lib/userStore";

import Chat from "@components/chat/Chat";
import Detail from "@components/detail/Detail";
import Login from "@components/login/Login";
import List from "@components/list/List";
import Notification from "@components/notification/Notification";

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
          <PollProvider>
            <List/>
            {chatId && <Chat/>}
            {chatId && <Detail/>}
          </PollProvider>
        ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App
