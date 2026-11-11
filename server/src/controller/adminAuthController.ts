import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";

import {
  findAdminByEmail,
  canSendOtp,
  invalidatePreviousOtps,
  createOtp,
  getLatestOtp,
  markOtpAsUsed,
} from "../models/otpModel.js";

import { sendAdminLoginOTP } from "../utils/mailService.js";

// Send OTP to admin email
export const sendLoginOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let savedOtpId: number | null = null;

  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check admin exists
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin email is not registered.",
      });
    }

    // Check OTP request limit
    const allowed = await canSendOtp(email);

    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: "OTP request limit reached. Please try again later.",
      });
    }

    // Generate secure six-digit OTP
    const otp = randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = await bcrypt.hash(otp, 10);

    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate previous OTPs
    await invalidatePreviousOtps(email);

    // Store new OTP
    savedOtpId = await createOtp(email, otpHash, expiresAt);

    // Send OTP email
    await sendAdminLoginOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
      expiresIn: 600,
    });
  } catch (error) {
    // If email sending fails, invalidate the saved OTP
    if (savedOtpId !== null) {
      try {
        await markOtpAsUsed(savedOtpId);
      } catch (cleanupError) {
        console.error("Failed to invalidate unsent OTP:", cleanupError);
      }
    }

    next(error);
  }
};

// Verify OTP and login admin
export const verifyLoginOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email and six-digit OTP.",
      });
    }

    // Check admin
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or OTP.",
      });
    }

    // Get latest unused, unexpired OTP
    const otpRecord = await getLatestOtp(email);

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "OTP is invalid, expired, or already used.",
      });
    }

    // Compare entered OTP with stored hash
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isOtpValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check JWT secret before consuming OTP
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // Mark OTP as used. This update is atomic, preventing reuse.
    const otpUsed = await markOtpAsUsed(otpRecord.id);

    if (!otpUsed) {
      return res.status(401).json({
        success: false,
        message: "OTP is invalid, expired, or already used.",
      });
    }

    // Generate JWT with admin ID, email, and role
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    // Successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        first_name: admin.first_name,
        last_name: admin.last_name,
      },
    });
  } catch (error) {
    next(error);
  }
};