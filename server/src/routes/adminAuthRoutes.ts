import { Router } from "express";
import {
  sendLoginOtp,
  verifyLoginOtp,
} from "../controller/adminAuthController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Authentication
 *   description: Admin email OTP authentication
 */

/**
 * @swagger
 * /admin/auth/send-otp:
 *   post:
 *     summary: Send OTP to admin email
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email
 *       404:
 *         description: Admin not found
 *       429:
 *         description: OTP request limit reached
 */
router.post("/admin/auth/send-otp", sendLoginOtp);

/**
 * @swagger
 * /admin/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login admin
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid or expired OTP
 */
router.post("/admin/auth/verify-otp", verifyLoginOtp);

export default router;