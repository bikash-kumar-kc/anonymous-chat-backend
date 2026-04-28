import { Router } from "express";
import { getActiveRooms, getActiveUsers, getBlackListedIps, getUser, handleAdminLogin, handleBlackListIp, removeBlackListIp, removeUser } from "../controller/admin.controller.js";
import { deactivateRoom } from "../db/queries/rooms.js";


export const adminRouter = Router();

adminRouter.post("/login",handleAdminLogin);
adminRouter.get("/",getActiveRooms);
adminRouter.delete("/:id",deactivateRoom);
adminRouter.get("/blacklist",getBlackListedIps);
adminRouter.post("/blackList",handleBlackListIp);
adminRouter.delete("/blackList/:hashedIp",removeBlackListIp);
adminRouter.get("/users",getActiveUsers);
adminRouter.get("/users/:userId",getUser);
adminRouter.delete("/users/:userId",removeUser);

