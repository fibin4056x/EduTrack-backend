import express from "express";
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";
import { verifyToken, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// get all users (principal only)
router.get("/",verifyToken, allowRoles("principal"), getuser);

//get single user 
router.get("/:id", verifyToken, getUserbyId);

// upodate user
 router.put("/:id", verifyToken, updateUser);

 //delete user
  router.delete("/:id", verifyToken, allowRoles("principal"), deleteUser);

export default router;