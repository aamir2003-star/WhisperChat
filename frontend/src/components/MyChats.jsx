import { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Plus } from "lucide-react";
import { isDefaultAvatar, getAvatarColor } from "../utils/avatarUtils";

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowStart.getTime() - dStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  } else {
    return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });
  }
};

const MyChats = ({ fetchAgain }) => {
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, setNotification } = ChatState();

  const fetchChats = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [fetchAgain, user]);

  const getSender = (loggedUser, users) => {
    if (!users || users.length === 0) return "Unknown User";
    if (users.length === 1) return users[0]?.username || "Unknown User";
    return users[0]?._id === loggedUser?._id 
      ? (users[1]?.username || "Unknown User") 
      : (users[0]?.username || "Unknown User");
  };

  const getSenderFull = (loggedUser, users) => {
    if (!users || users.length === 0) return {};
    if (users.length === 1) return users[0] || {};
    return users[0]?._id === loggedUser?._id ? (users[1] || {}) : (users[0] || {});
  };

  return (
    <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-1/3 lg:w-1/4 bg-card rounded-xl border border-border shadow-sm overflow-hidden`}>
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
        <h2 className="text-xl font-semibold">Chats</h2>
        <GroupChatModal>
          <button className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> New Group
          </button>
        </GroupChatModal>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chats ? (
          chats.map((chat) => {
            const unreadCount = chat.unreadCount || 0;
            return (
            <div
              onClick={() => {
                setSelectedChat(chat);
                setNotification(notification.filter((n) => n.chat._id !== chat._id));
                setChats((prevChats) =>
                  prevChats.map((c) =>
                    c._id === chat._id ? { ...c, unreadCount: 0 } : c
                  )
                );
              }}
              className={`cursor-pointer px-4 py-3 rounded-lg transition-colors border flex gap-3 items-center ${
                selectedChat === chat 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background hover:bg-muted border-transparent"
              }`}
              key={chat._id}
            >
              {!chat.isGroupChat ? (
                isDefaultAvatar(getSenderFull(user, chat.users)?.pic) ? (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${selectedChat === chat ? 'bg-primary-foreground/20 text-primary-foreground' : getAvatarColor(getSenderFull(user, chat.users)?._id)}`}>
                    {getSenderFull(user, chat.users)?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                ) : (
                  <img src={getSenderFull(user, chat.users)?.pic} alt="profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                )
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${selectedChat === chat ? 'bg-primary-foreground/20 text-primary-foreground' : getAvatarColor(chat._id)}`}>
                  {chat.chatName?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="font-medium truncate">
                    {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                  </div>
                  {chat.latestMessage && (
                    <span className={`text-[10px] shrink-0 ml-2 font-medium ${selectedChat === chat ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {formatMessageTime(chat.latestMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  {chat.latestMessage ? (
                    <div className={`text-xs truncate mr-2 flex-1 ${selectedChat === chat ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {chat.isGroupChat && (
                        <span className="font-medium">{chat.latestMessage.sender.username}: </span>
                      )}
                      {chat.latestMessage.content}
                    </div>
                  ) : (
                    <div className="text-xs truncate flex-1 italic opacity-60">No messages yet</div>
                  )}
                  {unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm shrink-0">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})
        ) : (
          <div className="text-center p-4 text-muted-foreground">Loading chats...</div>
        )}
      </div>
    </div>
  );
};

export default MyChats;
