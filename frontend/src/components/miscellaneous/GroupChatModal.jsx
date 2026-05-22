import React, { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import { X } from "lucide-react";
import { isDefaultAvatar, getAvatarColor } from "../../utils/avatarUtils";
import useDebounce from "../../hooks/useDebounce";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) {
        setSearchResult([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/user?search=${debouncedSearch}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setLoading(false);
        setSearchResult(data);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    };
    handleSearch();
  }, [debouncedSearch, user?.token]);

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/chat/group`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        }),
      });
      const data = await response.json();
      setChats([data, ...chats]);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative bg-card border border-border w-full max-w-md rounded-xl shadow-2xl p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Group Chat</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Chat Name"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>
              
              <div>
                <input
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Add Users eg: John, Piyush, Jane"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="flex items-center gap-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md"
                  >
                    {u.username}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleDelete(u)} />
                  </span>
                ))}
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="text-center text-sm text-muted-foreground p-2">Loading...</div>
                ) : searchResult?.length === 0 && search ? (
                  <div className="text-center text-sm text-muted-foreground p-2 bg-muted/20 rounded-md">User not found</div>
                ) : (
                  searchResult?.slice(0, 4).map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleGroup(user)}
                      className="flex items-center gap-3 p-2 bg-muted/50 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                    >
                      {isDefaultAvatar(user.pic) ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(user._id)}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <img src={user.pic} alt={user.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      )}
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-md transition-colors"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
