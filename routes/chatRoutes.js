const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const express = require("express");
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());

//create new chat
router.post("/create-new-chat", authMiddleware, async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    const savedChat = await newChat.save();

    await savedChat.populate("members");
    res.send({
      success: true,
      message: "chat Created Successfully",
      data: savedChat,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error creating chat",
      data: error.message,
    });
  }
});

//get all chats of current user
router.get("/get-all-chats", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: {
        $in: [req.body.userId],
      },
    }).populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.send({
      success: true,
      message: "chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error fetching chats",
      error: error.message,
    });
  }
});

//clear all unread messages of the chat
router.post("/clear-unread-messages", authMiddleware, async (req, res) => {
  try {
    //find the chat and update unread messages count to 0
    const chat = await Chat.findById(req.body.chatId);
    if (!chat) {
      return res.send({
        success: false,
        message: "chat not found",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      req.body.chatId,
      {
        unreadMessages: 0,
      },
      { new: true }
    ).populate("members")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
    //find all unread messages of this chat and update them to read
    await Message.updateMany(
      {
        chat: req.body.chatId,
        read: false,
      },
      {
        read: true,
      }
    );

    const chats = await Chat.find({
      members: {
        $in: [req.body.userId],
      },
    }).populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.send({
      success: true,
      message: "Unread messages cleared successfully",
      data: chats,
    });
  } catch (err) {
    res.send({
      success: false,
      message: "Error clearing Unread Messages",
      error: err.message,
    });
  }
});

module.exports = router;
