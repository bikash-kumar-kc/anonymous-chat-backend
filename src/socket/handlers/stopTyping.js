const onStopTyping = (io,socket,data)=>{
    if(!io || !socket || !data?.roomId?.trim()){
        return;
    };

    const {roomId,userId,displayName}= data;

    io.to(roomId).emit("stop-typing",{
        roomId,userId,displayName
    })
};


export default onStopTyping;