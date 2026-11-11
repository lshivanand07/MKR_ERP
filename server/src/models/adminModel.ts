import { db } from "../config/dbConnection.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Admin extends RowDataPacket {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  profile_image: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  role?: "admin" | "super_admin";
  profile_image?: string;
}

// GET ALL ADMINS
export const getAllAdmins = async (): Promise<Admin[]> => {
  const [rows] = await db.query<Admin[]>(
    `SELECT
      id,
      first_name,
      last_name,
      phone,
      email,
      profile_image,
      role,
      created_at,
      updated_at
     FROM admin
     ORDER BY id DESC`
  );

  return rows;
};

// GET ADMIN BY ID
export const getAdminById = async (
  id: number
): Promise<Admin | null> => {
  const [rows] = await db.query<Admin[]>(
    `SELECT
      id,
      first_name,
      last_name,
      phone,
      email,
      profile_image,
      role,
      created_at,
      updated_at
     FROM admin
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// UPDATE ADMIN
export const updateAdmin = async (
  id: number,
  data: AdminUpdateData
): Promise<boolean> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.first_name !== undefined) {
    fields.push("first_name = ?");
    values.push(data.first_name);
  }

  if (data.last_name !== undefined) {
    fields.push("last_name = ?");
    values.push(data.last_name);
  }

  if (data.phone !== undefined) {
    fields.push("phone = ?");
    values.push(data.phone);
  }

  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }

  if (data.role !== undefined) {
    fields.push("role = ?");
    values.push(data.role);
  }

  if (data.profile_image !== undefined) {
    fields.push("profile_image = ?");
    values.push(data.profile_image);
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(id);

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE admin SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
};

// DELETE ADMIN
export const deleteAdmin = async (
  id: number
): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM admin WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
};
