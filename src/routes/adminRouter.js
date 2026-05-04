import { Router } from "express";
import { getActiveRooms, getActiveRoomsId, getActiveUsers, getBlackListedIps, getUser, handleAdminLogin, handleBlackListIp, removeBlackListIp, removeUser } from "../controller/admin.controller.js";
import { deactivateRoom } from "../db/queries/rooms.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";


export const adminRouter = Router();

adminRouter.post("/login",handleAdminLogin);
adminRouter.get("/",adminAuthMiddleware,getActiveRooms);
adminRouter.delete("/:id",adminAuthMiddleware,deactivateRoom);
adminRouter.get("/ids",adminAuthMiddleware,getActiveRoomsId)
adminRouter.get("/blacklist",adminAuthMiddleware,getBlackListedIps);
adminRouter.post("/blackList",adminAuthMiddleware,handleBlackListIp);
adminRouter.delete("/blackList/:hashedIp",adminAuthMiddleware,removeBlackListIp);
adminRouter.get("/users",adminAuthMiddleware,getActiveUsers);
adminRouter.get("/users/:userId",adminAuthMiddleware,getUser);
adminRouter.delete("/users/:userId",adminAuthMiddleware,removeUser);


