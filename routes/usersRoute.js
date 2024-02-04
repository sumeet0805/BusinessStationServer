const User =require('../models/userModel');
const express=require('express')
const router=require('express').Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
router.use(express.json());
router.post("/register",async(req,res)=>{
    try{
        const test=1;
        const user=await User.findOne({email:req.body.email});
        if(user){
            res.send({
                success:false,
                message:'User already Exists'
            })
        }

        const hashpassword=await bcrypt.hash(req.body.password,10);
        req.body.password=hashpassword;
        const newUser=new User(req.body);
        await newUser.save();

        res.send({
            success:true,
            message:'User Created Successfully',
        })

    }catch(error){
        res.send({
            message:error.message,
            success:false,
        })
    }
})

router.post("/login",async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email});

        if(!user){
            res.send({
                success:true,
                message:'User does not exist',
            })
        }

        const validatepass=await bcrypt.compare(req.body.password,user.password);

        if(!validatepass){
            res.send({
                success:false,
                message:'Invalid password',
            })
            return;
        }

        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
            expiresIn:"1d"
        });
        res.send({
            success:true,
            message:'User login successfully',
            data:token
        })
    }catch(error){
        res.send({
            success:false,
            message:error.message,
        })
    }
})

router.get("/currentuser",authMiddleware, async(req,res)=>{
    try{
        const user=await User.findOne({_id:req.body.userId});
        res.send({
            success:true,
            message:"User Fetched successfully",
            data:user,
        });
    }catch(error){
        res.send({
            success:false,
            message:error.message,
        })
    }
})

router.get("/get-all-users",authMiddleware,async(req,res)=>{
    try{
        const allusers=await User.find({_id:{$ne:req.body.userId}});
        res.send({
            success:true,
            data:allusers,
            message:"Users fetch successfully",
        })
    }catch(err){
        res.send({
            message:"Failed to fetch data",
            success:false,
        })
    }
})
module.exports=router;