import { useState } from "react";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="w-full h-screen bg-background flex flex-col font-sans">
      {user && <SideDrawer />}
      <div className="flex w-full flex-1 overflow-hidden p-4 gap-4 max-w-400 mx-auto">
        {user && (
          <MyChats fetchAgain={fetchAgain} />
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
