import generateToken from "../config/generateToken.js";
import User from "../models/userModel.js";

// Register new user
export const registerUser = async (req, res) => {
  const { username, password, pic } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Please enter all the fields" });
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

