import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import User from "./models/userModel.js";
import Message from "./models/messageModel.js";
import Chat from "./models/chatModel.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

// Inject io to request object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io", socket.id);

  socket.on("setup", async (userData) => {
    if (!userData || !userData._id) return;
    socket.join(userData._id);
    socket.userId = userData._id;
    console.log("User Setup:", userData._id);

    try {
      await User.findByIdAndUpdate(userData._id, { isOnline: true });
      io.emit("user_status_change", { userId: userData._id, isOnline: true });

      // Mark all unread/undelivered messages for this user as delivered upon setup (going online)
      const userChats = await Chat.find({ users: userData._id });
      const chatIds = userChats.map((c) => c._id);

      const undeliveredMessages = await Message.find({
        chat: { $in: chatIds },
        sender: { $ne: userData._id },
        deliveredTo: { $ne: userData._id },
      });

      if (undeliveredMessages.length > 0) {
        await Message.updateMany(
          { _id: { $in: undeliveredMessages.map((m) => m._id) } },
          { $addToSet: { deliveredTo: userData._id } }
        );

        // Broadcast dynamic message status updates for real-time double grey ticks
        undeliveredMessages.forEach((msg) => {
          io.to(msg.chat.toString()).emit("message_status_update", {
            messageId: msg._id,
            chatId: msg.chat,
            userId: userData._id,
            status: "delivered",
          });
        });
      }
    } catch (e) {
      console.error("Error updating setup presence:", e);
    }
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("read chat", async ({ chatId, userId }) => {
    try {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: userId } },
        { $addToSet: { readBy: userId, deliveredTo: userId } }
      );
      socket.in(chatId).emit("chat_read", { chatId, userId });
    } catch (e) {
      console.error("Error in read chat event:", e);
    }
  });

  socket.on("deliver message", async ({ messageId, chatId, userId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deliveredTo: userId } },
        { new: true }
      ).populate("sender", "username pic").populate("chat");
      
      io.in(chatId).emit("message_status_update", {
        messageId,
        chatId,
        userId,
        status: "delivered",
        message: updatedMessage
      });
    } catch (e) {
      console.error("Error in deliver message event:", e);
    }
  });

  socket.on("read message", async ({ messageId, chatId, userId }) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId, deliveredTo: userId } },
        { new: true }
      ).populate("sender", "username pic").populate("chat");
      
      io.in(chatId).emit("message_status_update", {
        messageId,
        chatId,
        userId,
        status: "seen",
        message: updatedMessage
      });
    } catch (e) {
      console.error("Error in read message event:", e);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Connected socket disconnected:", socket.id);
    if (socket.userId) {
      try {
        const userId = socket.userId;
        // Find other active sockets for this user synchronously and reliably
        const activeSockets = Array.from(io.sockets.sockets.values()).filter(
          (s) => s.userId === userId && s.id !== socket.id
        );
        if (activeSockets.length === 0) {
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
          io.emit("user_status_change", { userId, isOnline: false, lastSeen });
          console.log(`User marked offline: ${userId}`);
        }
      } catch (e) {
        console.error("Error updating disconnect presence:", e);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
