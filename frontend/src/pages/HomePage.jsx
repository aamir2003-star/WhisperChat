import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { MessageSquare } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/20 rounded-full mb-4 ring-1 ring-primary/30 shadow-[0_0_15px_rgba(20,184,104,0.4)]">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WhisperChat</h1>
          <p className="text-white/70 mt-2 text-sm">Connect instantly, securely, beautifully.</p>
        </div>

        <div className="flex p-1 mb-6 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              tab === "login" ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setTab("login")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
              tab === "signup" ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setTab("signup")}
          >
            Create Account
          </button>
        </div>

        <div className="mt-4">
          {tab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
