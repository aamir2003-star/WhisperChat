import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
