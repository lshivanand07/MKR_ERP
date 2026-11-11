import { db } from "../config/dbConnection.js";
import { RowDataPacket } from "mysql2";

export interface EmployeeLoginRow extends RowDataPacket {
  id: number;
  employee_ID: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

export const getEmployeeLoginCredential = async (
  identifier: string
): Promise<EmployeeLoginRow[]> => {
  const [rows] = await db.query<EmployeeLoginRow[]>(
    `SELECT
      id,
      employee_ID,
      name,
      email,
      password,
      role,
      status
    FROM employees
    WHERE email = ? OR employee_ID = ?
    LIMIT 1`,
    [identifier, identifier]
  );

  return rows;
};
