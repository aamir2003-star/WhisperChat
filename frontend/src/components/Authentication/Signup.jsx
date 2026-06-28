import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ChatState } from "../../context/ChatProvider";
import { API_URL } from "../../config";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
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
      const response = await fetch(`${API_URL}/api/user`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ username, password, pic }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        setLoading(false);
        navigate("/chats");
      } else {
        setError(data.message || "Failed to create account. Please try a different username.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Signup error details:", error);
      setError(`Error Occurred! ${error.message || "Please try again."}`);
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
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/80 font-medium">Password</label>
        <input
          type="password"
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-white/40 transition-all"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/80 font-medium">Profile Picture Link (Optional)</label>
        <input
          type="text"
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-white/40 transition-all"
          placeholder="Paste a link to your picture"
          value={pic}
          onChange={(e) => setPic(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
      </button>
    </form>
  );
};

export default Signup;
