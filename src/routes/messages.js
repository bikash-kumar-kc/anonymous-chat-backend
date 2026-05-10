import express from "express";
import {db} from "../config/db.js";
import { asc } from 'drizzle-orm';
import { eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";
import {messages} from "../db/schema.js"

export const MessageRouter = express.Router();


MessageRouter.get("/:roomId",async(req,res,next)=>{
    const {roomId} = req.params;
    const isUuid = uuidValidate(roomId);
    if(!isUuid){
        return res.status(400).json({
            error:true,
            msg:"Invalid roomId"
        })
    };

    try {
        
        const allMessages = await db.select().from(messages).where(eq(messages.roomId,roomId)).orderBy(asc(messages.sentAt));

       return res.status(200).json({
        error:false,
        messages:allMessages,
        totalMessages:allMessages.length
       })
    } catch (error) {
       next(error)
    }
})