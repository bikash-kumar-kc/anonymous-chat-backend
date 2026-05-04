

const onStartTyping = (io,socket,data)=>{

    if(!io || !socket || !data?.roomId?.trim()){
        console.log("Problem at handling 'start-typing' event");
        return;
    };

    const {roomId,displayName,userId} = data;

    io.to(roomId).emit("start-typing",{
        roomId,
        userId,
        displayName
    });

    console.log(`
        typing status successfully sent
        `);
    return;

};


export default onStartTyping;