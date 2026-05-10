import express from "express";
import { validate as uuidValidate } from "uuid";
import {redis} from "../config/redis.js";
import { getIo } from "../config/socket.js";

export const UserRouter = express.Router();

UserRouter.get("/:roomId",async(req,res,next)=>{
    const {roomId} = req.params;
    const isUuid = uuidValidate(roomId);
    if(!isUuid){
        return res.status(400).json({
            error:true,
            msg:"Invalid roomId"
        })
    };

    try {

        const Users = await redis.smembers(`room:${roomId}:users`);
       

        if(Users && Users.length===0){
            return res.status(200).json({
                users:Users
            })
        };

        let userInfo = []

        for(let userId of Users){
            const user = await redis.hmget(`user:${userId}`,"displayName","userId");

            if (user && user.length === 2) {
                userInfo.push({
                    name: user[0],
                    userId: user[1]
                });
            }
        };

        const liveUsers = getIo()?.sockets.adapter.rooms.get(roomId)?.size || 0;

        return res.status(200).json({
            error:false,
            users:userInfo,
            totalUser:userInfo.length,
            liveUsers,
        })
    } catch (error) {
        next(error);
    }

})