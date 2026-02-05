import express from "express";
import { register, login } from "../controllers/user_controller.js";

const router = express.Router(); // 1. Fixed: Capital 'R'

router.route("/register").post(register); // 2. Fixed: Typo (was 'resgister')
 router.route("/login").post(login);       // 3. Added: Login route

export default router;