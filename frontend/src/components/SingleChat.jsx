import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import io from "socket.io-client";
import { isDefaultAvatar, getAvatarColor } from "../utils/avatarUtils";

const ENDPOINT = "http://localhost:3000";
let socket, selectedChatCompare;

const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return "offline";
  const date = new Date(lastSeenDate);
  const now = new Date();
  
  const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowStart.getTime() - dStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  
  if (diffDays === 0) {
    return `last seen today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `last seen yesterday at ${timeStr}`;
  } else if (diffDays > 1 && diffDays < 7) {
    const weekday = date.toLocaleDateString([], { weekday: "long" });
    return `last seen ${weekday} at ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });
    return `last seen on ${dateStr} at ${timeStr}`;
  }
};

const renderMessageTicks = (m, currentUser, chat, bubbleColor = "blue") => {
  if (!chat) return null;
  
  const otherUsers = chat.users.filter((u) => u._id !== currentUser._id);
  if (otherUsers.length === 0) return null;
  
  const readCount = otherUsers.filter((u) => m.readBy && m.readBy.includes(u._id)).length;
  const deliveredCount = otherUsers.filter((u) => m.deliveredTo && m.deliveredTo.includes(u._id)).length;
  
  const allRead = readCount === otherUsers.length;
  const allDelivered = deliveredCount === otherUsers.length || readCount > 0;

  if (allRead) {
    if (bubbleColor === "blue") {
      // Premium high-visibility light cyan seen ticks
      return <CheckCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0 filter drop-shadow-[0_0_2px_rgba(34,211,238,0.6)]" />;
    } else if (bubbleColor === "rose") {
      // Premium high-visibility glowing golden seen ticks
      return <CheckCheck className="w-3.5 h-3.5 text-amber-300 shrink-0 filter drop-shadow-[0_0_2px_rgba(252,211,77,0.6)]" />;
    } else {
      // Premium high-visibility light sky-blue seen ticks on emerald green bubble
      return <CheckCheck className="w-3.5 h-3.5 text-blue-300 shrink-0 filter drop-shadow-[0_0_2px_rgba(147,197,253,0.6)]" />;
    }
  } else if (allDelivered) {
    return <CheckCheck className="w-3.5 h-3.5 text-white/90 shrink-0" />;
  } else {
    return <Check className="w-3.5 h-3.5 text-white/60 shrink-0" />;
  }
};

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [bubbleColor, setBubbleColor] = useState(() => {
    return localStorage.getItem("chatBubbleTheme") || "blue";
  });
  const messagesEndRef = useRef(null);

  const { user, selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  const getSenderFull = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("user_status_change", ({ userId, isOnline, lastSeen }) => {
      setSelectedChat((prev) => {
        if (!prev) return prev;
        if (prev.isGroupChat) return prev;
        
        const otherUser = prev.users.find((u) => u._id === userId);
        if (!otherUser) return prev;

        const updatedUsers = prev.users.map((u) =>
          u._id === userId ? { ...u, isOnline, lastSeen } : u
        );
        return { ...prev, users: updatedUsers };
      });

      setChats((prevChats) => {
        if (!prevChats) return prevChats;
        return prevChats.map((c) => {
          if (c.isGroupChat) return c;
          const otherUser = c.users.find((u) => u._id === userId);
          if (!otherUser) return c;
          
          const updatedUsers = c.users.map((u) =>
            u._id === userId ? { ...u, isOnline, lastSeen } : u
          );
          return { ...c, users: updatedUsers };
        });
      });
    });

    socket.on("chat_read", ({ chatId, userId }) => {
      setSelectedChat((currentSelected) => {
        if (currentSelected && currentSelected._id === chatId) {
          setMessages((prevMessages) =>
            prevMessages.map((m) => {
              if (m.sender._id !== userId) {
                if (!m.readBy.includes(userId)) {
                  return {
                    ...m,
                    readBy: [...m.readBy, userId],
                    deliveredTo: m.deliveredTo.includes(userId)
                      ? m.deliveredTo
                      : [...m.deliveredTo, userId],
                  };
                }
              }
              return m;
            })
          );
        }
        return currentSelected;
      });
    });

    socket.on("message_status_update", ({ messageId, chatId, userId, status, message }) => {
      setSelectedChat((currentSelected) => {
        if (currentSelected && currentSelected._id === chatId) {
          setMessages((prevMessages) =>
            prevMessages.map((m) => {
              if (m._id === messageId) {
                const delivered = m.deliveredTo.includes(userId)
                  ? m.deliveredTo
                  : [...m.deliveredTo, userId];
                const read = status === "seen"
                  ? (m.readBy.includes(userId) ? m.readBy : [...m.readBy, userId])
                  : m.readBy;
                return { ...m, deliveredTo: delivered, readBy: read };
              }
              return m;
            })
          );
        }
        return currentSelected;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/message/${selectedChat._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      socket.emit("read chat", { chatId: selectedChat._id, userId: user._id });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        socket.emit("deliver message", {
          messageId: newMessageRecieved._id,
          chatId: newMessageRecieved.chat._id,
          userId: user._id,
        });

        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        socket.emit("read message", {
          messageId: newMessageRecieved._id,
          chatId: newMessageRecieved.chat._id,
          userId: user._id,
        });

        const updatedMessage = {
          ...newMessageRecieved,
          deliveredTo: newMessageRecieved.deliveredTo && newMessageRecieved.deliveredTo.includes(user._id)
            ? newMessageRecieved.deliveredTo
            : [...(newMessageRecieved.deliveredTo || []), user._id],
          readBy: newMessageRecieved.readBy && newMessageRecieved.readBy.includes(user._id)
            ? newMessageRecieved.readBy
            : [...(newMessageRecieved.readBy || []), user._id],
        };
        setMessages((prev) => [...prev, updatedMessage]);
      }
    });

    return () => {
      socket.off("message recieved");
    };
  }, [messages, notification, fetchAgain]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, istyping]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const messageToSend = newMessage;
        setNewMessage("");

        const response = await fetch("http://localhost:3000/api/message", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            content: messageToSend,
            chatId: selectedChat._id,
          }),
        });

        const data = await response.json();
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const typingHandler = (e) => {
    const val = e.target.value;
    setNewMessage(val);

    if (!socketConnected) return;

    if (!val.trim()) {
      if (typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 bg-muted rounded-full" onClick={() => setSelectedChat("")}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              {!selectedChat.isGroupChat ? (
                <div className="flex items-center gap-3">
                  {isDefaultAvatar(getSenderFull(user, selectedChat.users).pic) ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(getSenderFull(user, selectedChat.users)._id)}`}>
                      {getSenderFull(user, selectedChat.users).username.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img src={getSenderFull(user, selectedChat.users).pic} alt="profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">{getSenderFull(user, selectedChat.users).username}</span>
                    <span className={`text-[11px] leading-none mt-1 ${getSenderFull(user, selectedChat.users).isOnline ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                      {getSenderFull(user, selectedChat.users).isOnline ? "online" : formatLastSeen(getSenderFull(user, selectedChat.users).lastSeen)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(selectedChat._id)}`}>
                    {selectedChat.chatName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">{selectedChat.chatName.toUpperCase()}</span>
                    <span className="text-[11px] leading-none mt-1 text-muted-foreground">
                      {selectedChat.users.length} members
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bubble Theme Selector */}
            <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full border border-border shadow-inner">
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline select-none">Bubble:</span>
              <button 
                onClick={() => {
                  setBubbleColor("blue");
                  localStorage.setItem("chatBubbleTheme", "blue");
                }}
                className={`w-3.5 h-3.5 rounded-full bg-blue-600 transition-all ${bubbleColor === "blue" ? "ring-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"}`}
                title="Sapphire Blue"
              />
              <button 
                onClick={() => {
                  setBubbleColor("rose");
                  localStorage.setItem("chatBubbleTheme", "rose");
                }}
                className={`w-3.5 h-3.5 rounded-full bg-rose-600 transition-all ${bubbleColor === "rose" ? "ring-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"}`}
                title="Sunset Rose"
              />
              <button 
                onClick={() => {
                  setBubbleColor("green");
                  localStorage.setItem("chatBubbleTheme", "green");
                }}
                className={`w-3.5 h-3.5 rounded-full bg-emerald-600 transition-all ${bubbleColor === "green" ? "ring-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"}`}
                title="Emerald Green"
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-background">
            {loading ? (
              <div className="flex-1 flex justify-center items-center">Loading...</div>
            ) : (
              messages.map((m) => {
                const isMyMessage = m.sender._id === user._id;
                return (
                  <div key={m._id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                    {!isMyMessage && (
                      isDefaultAvatar(m.sender.pic) ? (
                        <div className={`w-6 h-6 rounded-full mr-2 self-end mb-1 flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(m.sender._id)}`}>
                          {m.sender.username.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <img src={m.sender.pic} className="w-6 h-6 rounded-full mr-2 self-end mb-1 shrink-0" alt={m.sender.username} />
                      )
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                        isMyMessage
                          ? `${
                              bubbleColor === "blue"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : bubbleColor === "rose"
                                ? "bg-rose-600 text-white rounded-br-sm"
                                : "bg-emerald-600 text-white rounded-br-sm"
                            }`
                          : "bg-muted text-muted-foreground rounded-bl-sm"
                      }`}
                    >
                      {selectedChat.isGroupChat && !isMyMessage && (
                        <div className="text-[10px] opacity-70 mb-1">{m.sender.username}</div>
                      )}
                      <div className="flex flex-col">
                        <span>{m.content}</span>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-70 self-end select-none">
                          <span className="text-[10px]">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                          {isMyMessage && renderMessageTicks(m, user, selectedChat, bubbleColor)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {istyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-2xl rounded-bl-sm text-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-muted/20 border-t border-border">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                className="flex-1 bg-background border border-input rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Type a message..."
                onChange={typingHandler}
                value={newMessage}
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full flex items-center justify-center transition-colors"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-muted-foreground flex flex-col items-center gap-2">
            <div className="p-4 bg-muted/50 rounded-full mb-2">
              <ArrowLeft className="w-8 h-8 opacity-50" />
            </div>
            Click on a user to start chatting
          </div>
        </div>
      )}
    </>
  );
};

export default SingleChat;
