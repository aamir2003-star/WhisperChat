import { ChatState } from "../context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden md:flex"
      } flex-col flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;
