import { db } from "../config/dbConnection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AdminLogin extends RowDataPacket {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

export interface OtpRecord extends RowDataPacket {
  id: number;
  email: string;
  otp_hash: string;
  expires_at: Date | string;
  is_used: number;
  created_at: Date;
}

// Find admin by email
export const findAdminByEmail = async (
  email: string
): Promise<AdminLogin | null> => {
  const [rows] = await db.query<AdminLogin[]>(
    `SELECT id, email, first_name, last_name, role
     FROM admin
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

// Limit OTP requests: one per minute and maximum five per hour
export const canSendOtp = async (email: string): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       SUM(created_at >= NOW() - INTERVAL 1 MINUTE) AS last_minute,
       COUNT(*) AS last_hour
     FROM otp
     WHERE email = ?
       AND created_at >= NOW() - INTERVAL 1 HOUR`,
    [email]
  );

  const lastMinute = Number(rows[0]?.last_minute || 0);
  const lastHour = Number(rows[0]?.last_hour || 0);

  return lastMinute === 0 && lastHour < 5;
};

// Mark previous unused OTPs as used
export const invalidatePreviousOtps = async (
  email: string
): Promise<void> => {
  await db.query(
    `UPDATE otp
     SET is_used = 1
     WHERE email = ?
       AND is_used = 0`,
    [email]
  );
};

// Save new OTP
export const createOtp = async (
  email: string,
  otpHash: string,
  expiresAt: Date
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO otp (email, otp_hash, expires_at, is_used)
     VALUES (?, ?, ?, 0)`,
    [email, otpHash, expiresAt]
  );

  return result.insertId;
};

// Get latest unused and unexpired OTP
export const getLatestOtp = async (
  email: string
): Promise<OtpRecord | null> => {
  const [rows] = await db.query<OtpRecord[]>(
    `SELECT id, email, otp_hash, expires_at, is_used, created_at
     FROM otp
     WHERE email = ?
       AND is_used = 0
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

// Mark OTP as used only if it is still valid
export const markOtpAsUsed = async (
  id: number
): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE otp
     SET is_used = 1
     WHERE id = ?
       AND is_used = 0
       AND expires_at > NOW()`,
    [id]
  );

  return result.affectedRows === 1;
};