import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

export const allMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;

    // Mark messages not sent by the logged-in user as delivered and read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId } },
      { 
        $addToSet: { 
          readBy: userId,
          deliveredTo: userId 
        } 
      }
    );

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username pic")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    deliveredTo: [req.user._id],
    readBy: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "username pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username pic",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
