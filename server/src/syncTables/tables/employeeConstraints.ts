import { db } from "../../config/dbConnection.js";

export const ensureEmployeeConstraints = async (): Promise<void> => {
  await db.query(`
    ALTER TABLE employees
    ADD UNIQUE KEY unique_employee_ID (employee_ID)
  `).catch(() => {});

  await db.query(`
    ALTER TABLE employees
    ADD UNIQUE KEY unique_employee_email (email)
  `).catch(() => {});

  await db.query(`
    ALTER TABLE employee_bank_details
    ADD UNIQUE KEY unique_employee_bank_employee_id (employee_id)
  `).catch(() => {});

  await db.query(`
    ALTER TABLE employee_bank_details
    ADD CONSTRAINT fk_employee_bank_details_employee
    FOREIGN KEY (employee_id)
    REFERENCES employees(id)
    ON DELETE CASCADE
  `).catch(() => {});
};