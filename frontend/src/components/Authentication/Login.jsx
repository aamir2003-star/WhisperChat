import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ChatState } from "../../context/ChatProvider";
import { API_URL } from "../../config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { setUser } = ChatState();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!username || !password) {
      setError("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        setLoading(false);
        navigate("/chats");
      } else {
        setError(data.message || "Incorrect username or password");
        setLoading(false);
      }
    } catch (error) {
      setError("Error Occurred! Please try again.", error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex flex-col gap-4">
      {error && <div className="p-3 rounded bg-red-500/20 text-red-200 text-sm border border-red-500/30">{error}</div>}
      
      <div className="space-y-1">
        <label className="text-sm text-white/80 font-medium">Username</label>
        <input
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-white/40 transition-all"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/80 font-medium">Password</label>
        <input
          type="password"
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-white/40 transition-all"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
      </button>

      <button
        type="button"
        onClick={() => {
          setUsername("guest");
          setPassword("123456");
        }}
        className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-lg transition-all border border-white/10"
      >
        Try Guest Account
      </button>
    </form>
  );
};

export default Login;
