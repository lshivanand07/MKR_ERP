import { db } from "../config/dbConnection.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface EmployeeBankDetailsInput {
  employee_id: number;
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  branch_name?: string;
  upi_id?: string;
  pan_number?: string;
}

export interface EmployeeBankDetailsUpdateInput {
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  branch_name?: string;
  upi_id?: string;
  pan_number?: string;
}

// Check whether employee exists by integer ID or employee code (e.g. MKRE0003)
export const checkEmployeeExists = async (
  employeeIdOrCode: number | string
): Promise<{ id: number; employee_ID: string } | null> => {
  const str = String(employeeIdOrCode).trim();
  const isNumeric = /^\d+$/.test(str);

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, employee_ID FROM employees
     WHERE ${isNumeric ? "id = ? OR employee_ID = ?" : "employee_ID = ?"}
     LIMIT 1`,
    isNumeric ? [Number(str), str] : [str]
  );

  if (rows.length === 0) return null;
  return { id: rows[0].id, employee_ID: rows[0].employee_ID };
};

// Create bank details
export const createEmployeeBankDetails = async (
  data: EmployeeBankDetailsInput
): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO employee_bank_details (
      employee_id,
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      upi_id,
      pan_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.employee_id,
      data.account_holder_name ?? null,
      data.bank_name ?? null,
      data.account_number ?? null,
      data.ifsc_code ?? null,
      data.branch_name ?? null,
      data.upi_id ?? null,
      data.pan_number ?? null,
    ]
  );

  return result.insertId;
};

// Get all bank details
export const getAllEmployeeBankDetails = async () => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
      b.id,
      b.employee_id,
      b.account_holder_name,
      b.bank_name,
      b.account_number,
      b.ifsc_code,
      b.branch_name,
      b.upi_id,
      b.pan_number,
      b.created_at,
      b.updated_at,
      e.employee_ID,
      e.name AS employee_name,
      e.email AS employee_email,
      e.employee_img
    FROM employee_bank_details b
    INNER JOIN employees e ON e.id = b.employee_id
    ORDER BY b.id DESC`
  );

  return rows;
};

// Get bank details by employee ID or employee code (e.g. MKRE0003)
export const getEmployeeBankDetailsByEmployeeId = async (
  employeeIdOrCode: number | string
) => {
  const str = String(employeeIdOrCode).trim();
  const isNumeric = /^\d+$/.test(str);

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
      b.id,
      b.employee_id,
      b.account_holder_name,
      b.bank_name,
      b.account_number,
      b.ifsc_code,
      b.branch_name,
      b.upi_id,
      b.pan_number,
      b.created_at,
      b.updated_at,
      e.employee_ID,
      e.name AS employee_name,
      e.email AS employee_email,
      e.employee_img
    FROM employee_bank_details b
    INNER JOIN employees e ON e.id = b.employee_id
    WHERE ${isNumeric ? "b.employee_id = ? OR e.employee_ID = ?" : "e.employee_ID = ?"}
    LIMIT 1`,
    isNumeric ? [Number(str), str] : [str]
  );

  return rows[0] ?? null;
};

// Update bank details by employee database ID
export const updateEmployeeBankDetails = async (
  employeeId: number,
  data: EmployeeBankDetailsUpdateInput
): Promise<boolean> => {
  const allowedFields = [
    "account_holder_name",
    "bank_name",
    "account_number",
    "ifsc_code",
    "branch_name",
    "upi_id",
    "pan_number",
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

  values.push(employeeId);

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE employee_bank_details
     SET ${fields.join(", ")}
     WHERE employee_id = ?`,
    values
  );

  return result.affectedRows > 0 || result.changedRows === 0;
};

// Delete bank details by employee database ID
export const deleteEmployeeBankDetails = async (
  employeeId: number
): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM employee_bank_details WHERE employee_id = ?`,
    [employeeId]
  );

  return result.affectedRows > 0;
};

export const getEmployeeBankDetails = getEmployeeBankDetailsByEmployeeId;
