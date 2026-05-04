import { redis } from "../config/redis.js";

export  const isUserAlreadyExist = async(hashedIp)=>{

    if(!hashedIp){
        console.log(`hashed ip is missing`)
        return;
    };

    return await redis.exists(`userHashedIp:${hashedIp}`);
};