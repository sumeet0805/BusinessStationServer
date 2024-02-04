const mongoose=require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URL);

const db=mongoose.connection;

db.on('connected',()=>{
    console.log('MongoDB Connection Successfull');
})

db.on('error',(err)=>{
    console.log('MongoDB Connection Failed'+err);
})

module.exports=db;
