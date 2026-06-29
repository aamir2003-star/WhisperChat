import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { 
  MessageSquare, 
  Shield, 
  Sparkles, 
  Check, 
  CheckCheck, 
  Users, 
  Search, 
  ArrowRight, 
  MessageCircle 
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  // Loop through stages to animate the CSS mockup conversation
  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0b141a] text-slate-100 flex flex-col relative overflow-hidden font-sans scroll-smooth">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b141a]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">WhisperChat</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection("features")} className="hover:text-emerald-400 transition-colors cursor-pointer">Features</button>
            <a href="https://github.com/aamir2003-star/WhisperChat" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">GitHub</a>
            <button onClick={() => scrollToSection("login-section")} className="hover:text-emerald-400 transition-colors cursor-pointer">Security</button>
          </nav>
          
          <button 
            onClick={() => scrollToSection("login-section")}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#0b141a] font-bold text-sm px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            Start Chatting
          </button>
        </div>
      </header>

      {/* Section 1: Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-64px)]">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide w-fit">
            <Shield className="w-3.5 h-3.5" />
            Secure & Real-Time Messaging
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Simple. Personal.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Real-time chat.</span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            Connect instantly and securely. WhisperChat brings you the signature real-time behaviors of WhatsApp—complete with user presence, instant typing indicators, dynamic timestamps, customizable chat bubble themes, and live status ticks.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => scrollToSection("login-section")}
              className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b141a] font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              Open Web App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer"
            >
              Explore Features
            </button>
          </div>
          
          <div className="flex items-center gap-6 pt-6 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Status Ticks
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Custom Themes
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              Live Presence
            </div>
          </div>
        </div>
        
        {/* Right Column: Chat UI Mockup */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[380px] bg-[#111b21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[460px] relative select-none">
            {/* Mockup Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-sm text-[#0b141a]">
                  B
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">Bob</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-emerald-400 font-medium">online</span>
                  </div>
                </div>
              </div>
              
              {/* Theme Selector display */}
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white/10"></span>
                <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider">Emerald</span>
              </div>
            </div>
            
            {/* Mockup Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[size:180px] bg-opacity-[0.06] flex flex-col justify-end">
              
              {/* Bubble 1: Bob (Left) */}
              <div className="flex flex-col max-w-[80%] self-start bg-[#202c33] text-slate-200 rounded-lg rounded-tl-none px-3.5 py-2 text-xs shadow-sm relative">
                <p>Hey Alice! Have you seen the live ticks on WhisperChat? Check this out!</p>
                <span className="text-[9px] text-slate-400 self-end mt-1">10:14 AM</span>
              </div>
              
              {/* Bubble 2: Alice (Right, Sent status) */}
              {chatStep >= 1 && (
                <div className="flex flex-col max-w-[80%] self-end bg-[#025244] text-white rounded-lg rounded-tr-none px-3.5 py-2 text-xs shadow-sm relative transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <p>Yes, they sync instantly! Let me send a quick message... 🚀</p>
                  <div className="flex items-center gap-1 self-end mt-1">
                    <span className="text-[9px] text-emerald-300/70">10:15 AM</span>
                    {chatStep === 1 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400/50" />
                    ) : chatStep === 2 ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400/50" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              )}
              
              {/* Bubble 3: Bob (Left, Typing) */}
              {chatStep === 4 && (
                <div className="flex items-center gap-1.5 self-start bg-[#202c33] text-slate-400 rounded-lg rounded-tl-none px-3.5 py-3 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
              
              {/* Bubble 4: Bob (Left, Reply) */}
              {chatStep === 5 && (
                <div className="flex flex-col max-w-[80%] self-start bg-[#202c33] text-slate-200 rounded-lg rounded-tl-none px-3.5 py-2 text-xs shadow-sm relative transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <p>Woah, that was instant! WhisperChat is amazing. 🔥</p>
                  <span className="text-[9px] text-slate-400 self-end mt-1">10:15 AM</span>
                </div>
              )}
            </div>
            
            {/* Mockup Footer */}
            <div className="bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
              <div className="flex-1 bg-[#2a3942] rounded-lg px-3.5 py-1.5 text-xs text-slate-400 border border-white/5">
                {chatStep === 0 ? "Alice typing..." : chatStep === 4 ? "Bob is typing..." : "Type a message"}
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[#0b141a]">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Access & Features Portal */}
      <section id="login-section" className="relative w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 scroll-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Features Grid */}
          <div id="features" className="lg:col-span-7 space-y-8 scroll-mt-20">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Everything you love about modern chat.
              </h2>
              <p className="text-slate-400 max-w-lg leading-relaxed text-sm md:text-base">
                WhisperChat combines the familiar WhatsApp interface layout with beautiful web aesthetics and interactive options.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Card 1 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">Status Ticks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sent (✓), Delivered (✓✓ grey), and Seen (✓✓ colored) ticks update instantly using socket hooks.
                </p>
              </div>
              
              {/* Feature Card 2 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">Interactive Themes</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customize your experience. Swap bubble styling from Sapphire Blue to Sunset Rose or classic Emerald Green instantly.
                </p>
              </div>
              
              {/* Feature Card 3 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">Live Presence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time tracking displays who is online. Offline partners display detailed, humanized last seen durations.
                </p>
              </div>
              
              {/* Feature Card 4 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">Debounced Search</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quickly locate other users using the built-in search filter, optimized with smart input debouncing.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Login/Signup Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex flex-col items-center mb-6">
                <div className="p-2.5 bg-emerald-500/20 rounded-full mb-3 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">WhisperChat App</h2>
                <p className="text-slate-400 mt-1 text-xs text-center">Login or Sign up to access your personal dashboard.</p>
              </div>

              <div className="flex p-1 mb-6 bg-black/40 rounded-xl border border-white/5">
                <button
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                    tab === "login" ? "bg-emerald-500 text-[#0b141a] shadow-md shadow-emerald-500/10" : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setTab("login")}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                    tab === "signup" ? "bg-emerald-500 text-[#0b141a] shadow-md shadow-emerald-500/10" : "text-slate-400 hover:text-white"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 bg-[#0b141a] text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WhisperChat. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;

