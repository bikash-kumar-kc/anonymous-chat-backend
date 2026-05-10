

const onStartTyping = (io,socket,data)=>{

    if(!io || !socket || !data?.roomId?.trim()){
        return;
    };

    const {roomId,displayName,userId} = data;

    io.to(roomId).emit("start-typing",{
        roomId,
        userId,
        displayName
    });

    return;

};


export default onStartTyping;