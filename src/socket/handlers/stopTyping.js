const onStopTyping = (io,socket,data)=>{
    if(!io || !socket || !data?.roomId?.trim()){
        console.log("Problem at handling 'start-typing' event");
        return;
    };

    const {roomId,userId,displayName}= data;

    io.to(roomId).emit("stop-typing",{
        roomId,userId,displayName
    })
};


export default onStopTyping;