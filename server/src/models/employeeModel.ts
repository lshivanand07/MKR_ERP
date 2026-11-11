import { db } from "../config/dbConnection.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface EmployeeRow extends RowDataPacket {
  id: number;
  employee_ID: string;
  name: string;
  designation: string | null;
  email: string;
  employee_img: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  date_of_joining: string | null;
  basic_salary: number;
  communication_address: string | null;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeInput {
  name: string;
  designation?: string | null;
  email: string;
  password: string;
  employee_img?: string | null;
  primary_phone?: string | null;
  secondary_phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_of_joining?: string | null;
  basic_salary?: number;
  communication_address?: string | null;
  role?: string;
  status?: string;
}

export interface EmployeeUpdateInput {
  name?: string;
  designation?: string | null;
  email?: string;
  employee_img?: string | null;
  primary_phone?: string | null;
  secondary_phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_of_joining?: string | null;
  basic_salary?: number;
  communication_address?: string | null;
  role?: string;
  status?: string;
}

export const findEmployeeByEmail = async (
  email: string
): Promise<EmployeeRow | null> => {
  const [rows] = await db.query<EmployeeRow[]>(
    `SELECT * FROM employees WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
};

// Find employee by either integer ID or string employee_ID (e.g. MKRE0003)
export const getEmployeeByIdentifier = async (
  identifier: string | number
): Promise<EmployeeRow | null> => {
  const str = String(identifier).trim();
  const isNumeric = /^\d+$/.test(str);

  const [rows] = await db.query<EmployeeRow[]>(
    `SELECT
      id,
      employee_ID,
      name,
      designation,
      email,
      employee_img,
      primary_phone,
      secondary_phone,
      gender,
      date_of_birth,
      date_of_joining,
      basic_salary,
      communication_address,
      role,
      status,
      created_at,
      updated_at
    FROM employees
    WHERE ${isNumeric ? "id = ? OR employee_ID = ?" : "employee_ID = ?"}
    LIMIT 1`,
    isNumeric ? [Number(str), str] : [str]
  );

  return rows[0] ?? null;
};

export const getEmployeeById = getEmployeeByIdentifier;

export const createEmployee = async (
  data: EmployeeInput
): Promise<{ id: number; employee_ID: string }> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Query both highest MKRE suffix and highest id
    const [existing] = await connection.query<RowDataPacket[]>(
      `SELECT employee_ID FROM employees
       WHERE employee_ID REGEXP '^MKRE[0-9]+$'
       ORDER BY LENGTH(employee_ID) DESC, employee_ID DESC
       LIMIT 1
       FOR UPDATE`
    );

    let nextNumber = 1;
    if (existing.length > 0 && existing[0]?.employee_ID) {
      const match = String(existing[0].employee_ID).match(/^MKRE(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    } else {
      const [countRows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total, MAX(id) AS max_id FROM employees`
      );
      const currentCount = Number(countRows[0]?.total || 0);
      const maxId = Number(countRows[0]?.max_id || 0);
      const baseNum = Math.max(currentCount, maxId);
      nextNumber = baseNum > 0 ? baseNum + 1 : 1;
    }

    const employee_ID = `MKRE${String(nextNumber).padStart(4, "0")}`;

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO employees
      (
        employee_ID,
        name,
        designation,
        email,
        password,
        employee_img,
        primary_phone,
        secondary_phone,
        gender,
        date_of_birth,
        date_of_joining,
        basic_salary,
        communication_address,
        role,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_ID,
        data.name,
        data.designation ?? null,
        data.email,
        data.password,
        data.employee_img ?? null,
        data.primary_phone ?? null,
        data.secondary_phone ?? null,
        data.gender ?? null,
        data.date_of_birth ?? null,
        data.date_of_joining ?? null,
        data.basic_salary ?? 0,
        data.communication_address ?? null,
        data.role ?? "employee",
        data.status ?? "Active",
      ]
    );

    await connection.commit();

    return {
      id: result.insertId,
      employee_ID,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllEmployees = async (
  page: number,
  limit: number,
  search: string
): Promise<{ employees: EmployeeRow[]; total: number }> => {
  const offset = (page - 1) * limit;
  const searchValue = `%${search}%`;

  const [employees] = await db.query<EmployeeRow[]>(
    `SELECT
      id,
      employee_ID,
      name,
      designation,
      email,
      employee_img,
      primary_phone,
      secondary_phone,
      gender,
      date_of_birth,
      date_of_joining,
      basic_salary,
      communication_address,
      role,
      status,
      created_at,
      updated_at
    FROM employees
    WHERE name LIKE ?
       OR employee_ID LIKE ?
       OR email LIKE ?
       OR primary_phone LIKE ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?`,
    [searchValue, searchValue, searchValue, searchValue, limit, offset]
  );

  const [countResult] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM employees
     WHERE name LIKE ?
        OR employee_ID LIKE ?
        OR email LIKE ?
        OR primary_phone LIKE ?`,
    [searchValue, searchValue, searchValue, searchValue]
  );

  return {
    employees,
    total: Number(countResult[0]?.total || 0),
  };
};

export const updateEmployee = async (
  id: number,
  data: EmployeeUpdateInput
): Promise<boolean> => {
  const allowedFields = [
    "name",
    "designation",
    "email",
    "employee_img",
    "primary_phone",
    "secondary_phone",
    "gender",
    "date_of_birth",
    "date_of_joining",
    "basic_salary",
    "communication_address",
    "role",
    "status",
  ] as const;

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`\`${field}\` = ?`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(id);

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE employees SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
};

export const deleteEmployee = async (id: number): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM employees WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};
