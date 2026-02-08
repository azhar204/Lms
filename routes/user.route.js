import express from "express";
import { register, login } from "../controllers/user_controller.js";

const router = express.Router(); // 1. Fixed: Capital 'R'

router.route("/register").post(register); // 2. Fixed: Typo (was 'resgister')
 router.route("/login").post(login);  
 router.route("/logout").get(logout);
      // 3. Added: Login route
router.route("/profile").get(isAuthenticated, getUserProfile);

export default router;