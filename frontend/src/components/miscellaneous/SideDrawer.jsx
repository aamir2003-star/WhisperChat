import React, { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, X, Moon, Sun } from "lucide-react";
import { isDefaultAvatar, getAvatarColor } from "../../utils/avatarUtils";
import useDebounce from "../../hooks/useDebounce";
import { API_URL } from "../../config";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const { user, setUser, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      if (user?.token) {
        await fetch(`${API_URL}/api/user/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    }
    localStorage.removeItem("userInfo");
    setUser(null);
    setSelectedChat(null);
    setChats([]);
    setNotification([]);
    navigate("/");
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearch) {
        setSearchResult([]);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/user?search=${debouncedSearch}`, {
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

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setIsDrawerOpen(false);
    } catch (error) {
      setLoadingChat(false);
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-card text-card-foreground border-b border-border px-6 py-3 w-full shadow-sm z-10">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search Users</span>
        </button>

        <h1 className="text-xl font-bold text-primary tracking-tight">WhisperChat</h1>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-full relative transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          </button>
          <div className="relative">
            <button className="p-2 hover:bg-muted rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            {notification.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm pointer-events-none">
                {notification.length}
              </span>
            )}
          </div>
          
          <div className="group relative">
            <button className="flex items-center gap-2">
              {isDefaultAvatar(user.pic) ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-border ${getAvatarColor(user._id)}`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img src={user.pic} alt={user.username} className="w-8 h-8 rounded-full border border-border object-cover" />
              )}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium truncate">{user.username}</p>
              </div>
              <button 
                onClick={logoutHandler}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-80 max-w-sm bg-card h-full shadow-2xl flex flex-col transform transition-transform border-r border-border">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold text-lg">Search Users</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <input
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center p-4 text-sm text-muted-foreground">Loading...</div>
              ) : searchResult?.length === 0 && search ? (
                <div className="text-center p-4 text-sm text-muted-foreground bg-muted/20 rounded-lg">No users found for "{search}"</div>
              ) : (
                searchResult?.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => accessChat(user._id)}
                    className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted hover:text-primary rounded-lg cursor-pointer transition-colors"
                  >
                    {isDefaultAvatar(user.pic) ? (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(user._id)}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img src={user.pic} alt={user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideDrawer;
