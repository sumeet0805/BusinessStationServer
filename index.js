const express=require('express');
const userRoute=require('./routes/usersRoute')
const chatRouter=require('./routes/chatRoutes')
const messagesRouter=require('./routes/messagesRoutes')
//const server= require("socket.io");
const app=express();
const cors = require('cors');
const dbconfig=require("./config/dbConfig")
const port=process.env.port || 5000;
app.use(cors());
app.use(express.json());
const server=require("http").createServer(app);
app.use('/api/users',userRoute);
app.use('/api/chats',chatRouter);
app.use('/api/messages',messagesRouter); 
const io=require("socket.io")(server,{
    cors:{
        origin:"http://localhost:3000",
        method:["GET","POST"]
    }
}); 

io.on("connection",(socket)=>{
   console.log("Repeated Task",socket._id);
   socket.on("join-room",(userId)=>{
    console.log("user joined room",userId);
    socket.join(userId);
   })
   socket.on('reconnect', function() {
    console.log('Reconnected to server');
    });
   socket.on("send-message",(message)=>{
    console.log("emit event ",message.members[0]," message ",message," and ",message.members[1])
        io.to(message.members[0]).emit("receive-message",message);
        io.to(message.members[1]).emit("receive-message",message);
   })

   socket.on("clear-unread-message",data=>{
    io.to(data.members[0])
        .to(data.members[1])
        .emit("unread-messages-cleared",data)
   })
}) 

server.listen(port,()=>console.log(`server is running on port ${port}`))
