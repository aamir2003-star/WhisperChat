import generateToken from "../config/generateToken.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

// Register new user
export const registerUser = async (req, res) => {
  const { username, password, pic } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Please enter all the fields" });
    return;
  }

  // Prevent registering with the system bot name
  if (username.toLowerCase() === "whisperchat") {
    res.status(400).json({ message: "Username 'WhisperChat' is reserved for system use." });
    return;
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({
    username,
    password,
    pic,
  });

  if (user) {
    // Automatically create a default welcome chat from 'WhisperChat' system bot
    try {
      let whisperChatBot = await User.findOne({ username: "WhisperChat" });
      if (!whisperChatBot) {
        whisperChatBot = await User.create({
          username: "WhisperChat",
          password: "system_generated_whisperchat_bot_secure_password_98234",
          pic: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        });
      }

      // Create a 1-on-1 chat between the new user and the system bot
      const welcomeChat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [user._id, whisperChatBot._id],
      });

      const welcomeText = `🎉 Welcome to WhisperChat, ${user.username}! We're thrilled to have you here.

Here are some of the features you can explore:
💬 Direct Messaging: Chat privately with your friends in real-time.
👥 Group Chats: Create group chats by clicking "New Group" and add multiple friends.
🔔 Dynamic Read Receipts: Check delivery and read status instantly (Single Grey Tick: Sent, Double Grey Ticks: Delivered, Double Blue Ticks: Read).
🟢 Active Presence: Keep track of who is online and when they were last active.
🌙 Dark Mode: Switch between light and dark modes easily using the sun/moon icon at the top.
🔍 User Search: Use the search panel on the top-left to find other users by their username and start chatting!

Enjoy connecting securely and beautifully!`;

      // Create the welcome message
      const welcomeMessage = await Message.create({
        sender: whisperChatBot._id,
        content: welcomeText,
        chat: welcomeChat._id,
        deliveredTo: [user._id],
        readBy: [],
      });

      // Update the chat with the latest message
      await Chat.findByIdAndUpdate(welcomeChat._id, {
        latestMessage: welcomeMessage._id,
      });
    } catch (welcomeError) {
      console.error("Failed to generate welcome chat:", welcomeError);
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Failed to create the user" });
  }
};

// Login user
export const authUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid Username or Password" });
  }
};

// /api/user?search=aamir
export const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        username: { $regex: "^" + req.query.search, $options: "i" },
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

// Logout user (explicit DB offline status update and real-time status broadcast)
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });

    if (req.io) {
      req.io.emit("user_status_change", { userId, isOnline: false, lastSeen });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

