const router=require('express').Router();
const express=require('express')
const Chat=require('../models/chatModel');
const messages=require('../models/messageModel')
const authMiddleware=require('../middleware/authMiddleware')
router.use(express.json());

//new message
router.post('/new-message',async(req,res)=>{
    try{
        
        //store messages
        const newMessage= new messages(req.body);
        const savedMessage=await newMessage.save();

        //update last message of chat
        const chat=await Chat.findOneAndUpdate(
            {_id:req.body.chat},
            {lastMessage:savedMessage._id,
            $inc: { unreadMessages : 1},
            
        });
        await chat.save();

        res.send({
            success:true,
            message:"Message sent successfully",
            data:savedMessage,
        })
    }catch(err){
            throw err;
    }
})

//get all messages of a chat
router.get('/get-all-messages/:chatId',async(req,res)=>{
    try{
        const message=await messages.find({
            chat:req.params.chatId,
        })
        res.send({
            success:true,
            message:"Messages fetched successfully",
            data:message,
        })
    }catch(err){
        res.send({
            success:false,
            message:"Error Fetching Messages",
            data:err.message,
    })
    }
})

module.exports=router;