import type { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByIdentifier,
  updateEmployee,
  deleteEmployee,
  findEmployeeByEmail,
  type EmployeeInput,
  type EmployeeUpdateInput,
} from "../models/employeeModel.js";

import { sendEmployeeCredentialsEmail } from "../utils/mailService.js";

// ==========================================
// HELPER: DELETE EMPLOYEE IMAGE FROM DISK
// ==========================================
const removeEmployeeImage = async (
  imagePath: string | null | undefined
): Promise<void> => {
  if (!imagePath) return;

  const fileName = path.basename(imagePath);
  if (!fileName || fileName === "." || fileName === "..") {
    return;
  }

  const fullPath = path.join(
    process.cwd(),
    "uploads",
    "employee",
    fileName
  );

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code !== "ENOENT") {
      console.error("Employee image deletion failed:", error);
    }
  }
};

// ==========================================
// HELPER: GENERATE SECURE RANDOM PASSWORD
// ==========================================
const generateRandomPassword = (length = 10): string => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
  let password = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  return password;
};

// ==========================================
// CREATE EMPLOYEE
// ==========================================
export const createEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadedImage = req.file?.filename;

  try {
    const {
      name,
      designation,
      email,
      primary_phone,
      secondary_phone,
      gender,
      date_of_birth,
      date_of_joining,
      basic_salary,
      communication_address,
      role,
      status,
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(400).json({
        success: false,
        message: "Employee name is required.",
      });
      return;
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(400).json({
        success: false,
        message: "Employee email is required.",
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    // Check if email already registered
    const existingEmployee = await findEmployeeByEmail(trimmedEmail);
    if (existingEmployee) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(409).json({
        success: false,
        message: "An employee with this email already exists.",
      });
      return;
    }

    // Auto-generate secure password
    const autoPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    // Profile image path
    const employeeImgPath = req.file
      ? `uploads/employee/${req.file.filename}`
      : req.body.employee_img?.trim() || null;

    const newEmployeeData: EmployeeInput = {
      name: name.trim(),
      designation: designation ? String(designation).trim() : null,
      email: trimmedEmail,
      password: hashedPassword,
      employee_img: employeeImgPath,
      primary_phone: primary_phone ? String(primary_phone).trim() : null,
      secondary_phone: secondary_phone ? String(secondary_phone).trim() : null,
      gender: gender ? String(gender).trim() : null,
      date_of_birth: date_of_birth ? String(date_of_birth).trim() : null,
      date_of_joining: date_of_joining ? String(date_of_joining).trim() : null,
      basic_salary: basic_salary !== undefined && basic_salary !== "" ? Number(basic_salary) : 0,
      communication_address: communication_address
        ? String(communication_address).trim()
        : null,
      role: role ? String(role).trim() : "employee",
      status: status ? String(status).trim() : "Active",
    };

    const created = await createEmployee(newEmployeeData);

    // Send credentials email
    let emailSent = false;
    let emailWarning: string | null = null;
    try {
      await sendEmployeeCredentialsEmail({
        name: newEmployeeData.name,
        employee_ID: created.employee_ID,
        email: newEmployeeData.email,
        password: autoPassword,
      });
      emailSent = true;
    } catch (err: any) {
      console.error("Failed to send credentials email:", err);
      emailWarning =
        err?.message || "Failed to send credentials to employee email";
    }

    const employeeRecord = await getEmployeeById(created.id);

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Employee created successfully and login credentials sent via email."
        : "Employee created successfully, but credentials email could not be delivered.",
      emailSent,
      ...(emailWarning ? { emailWarning } : {}),
      data: employeeRecord,
    });
  } catch (error: any) {
    console.error("Create employee error:", error);

    if (uploadedImage) {
      await removeEmployeeImage(uploadedImage);
    }

    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        success: false,
        message: "Duplicate entry. Employee ID or email already exists.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create employee.",
    });
  }
};

// ==========================================
// GET ALL EMPLOYEES
// ==========================================
export const getAllEmployeesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const { employees, total } = await getAllEmployees(page, limit, search);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully.",
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees.",
    });
  }
};

// ==========================================
// GET EMPLOYEE BY ID OR EMPLOYEE CODE (e.g. MKRE0003)
// ==========================================
export const getEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const param = String(req.params.id) || String(req.params.employeeId) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const employee = await getEmployeeByIdentifier(param);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully.",
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee.",
    });
  }
};

export const getEmployeeByIdController = getEmployeeController;

// ==========================================
// UPDATE EMPLOYEE BY ID OR EMPLOYEE CODE (e.g. MKRE0003)
// ==========================================
export const updateEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadedImage = req.file?.filename;

  try {
    const param = String(req.params.id) || String(req.params.employeeId) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const existingEmployee = await getEmployeeByIdentifier(param);
    if (!existingEmployee) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    const id = existingEmployee.id;
    const updateData: EmployeeUpdateInput = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        if (uploadedImage) await removeEmployeeImage(uploadedImage);
        res.status(400).json({
          success: false,
          message: "Employee name cannot be empty.",
        });
        return;
      }
      updateData.name = name;
    }

    if (req.body.designation !== undefined) {
      updateData.designation = String(req.body.designation).trim() || null;
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (uploadedImage) await removeEmployeeImage(uploadedImage);
        res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
        return;
      }

      const duplicate = await findEmployeeByEmail(email);
      if (duplicate && duplicate.id !== id) {
        if (uploadedImage) await removeEmployeeImage(uploadedImage);
        res.status(409).json({
          success: false,
          message: "Email is already in use by another employee.",
        });
        return;
      }

      updateData.email = email;
    }

    if (req.file) {
      updateData.employee_img = `uploads/employee/${req.file.filename}`;
    } else if (req.body.employee_img !== undefined) {
      updateData.employee_img = req.body.employee_img
        ? String(req.body.employee_img).trim()
        : null;
    }

    if (req.body.primary_phone !== undefined) {
      updateData.primary_phone = String(req.body.primary_phone).trim() || null;
    }

    if (req.body.secondary_phone !== undefined) {
      updateData.secondary_phone = String(req.body.secondary_phone).trim() || null;
    }

    if (req.body.gender !== undefined) {
      updateData.gender = String(req.body.gender).trim() || null;
    }

    if (req.body.date_of_birth !== undefined) {
      updateData.date_of_birth = String(req.body.date_of_birth).trim() || null;
    }

    if (req.body.date_of_joining !== undefined) {
      updateData.date_of_joining = String(req.body.date_of_joining).trim() || null;
    }

    if (req.body.basic_salary !== undefined && req.body.basic_salary !== "") {
      updateData.basic_salary = Number(req.body.basic_salary);
    }

    if (req.body.communication_address !== undefined) {
      updateData.communication_address =
        String(req.body.communication_address).trim() || null;
    }

    if (req.body.role !== undefined) {
      updateData.role = String(req.body.role).trim();
    }

    if (req.body.status !== undefined) {
      updateData.status = String(req.body.status).trim();
    }

    if (Object.keys(updateData).length === 0) {
      if (uploadedImage) await removeEmployeeImage(uploadedImage);
      res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
      return;
    }

    await updateEmployee(id, updateData);

    const updatedEmployee = await getEmployeeById(id);

    // Remove old image if a new one was uploaded
    if (
      req.file &&
      existingEmployee.employee_img &&
      existingEmployee.employee_img !== updatedEmployee?.employee_img
    ) {
      await removeEmployeeImage(existingEmployee.employee_img);
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      data: updatedEmployee,
    });
  } catch (error: any) {
    console.error("Update employee error:", error);

    if (uploadedImage) {
      await removeEmployeeImage(uploadedImage);
    }

    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update employee.",
    });
  }
};

// ==========================================
// DELETE EMPLOYEE BY ID OR EMPLOYEE CODE (e.g. MKRE0003)
// ==========================================
export const deleteEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const param = String(req.params.id) || String(req.params.employeeId) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const existingEmployee = await getEmployeeByIdentifier(param);
    if (!existingEmployee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    await deleteEmployee(existingEmployee.id);

    // Remove employee image from disk
    if (existingEmployee.employee_img) {
      await removeEmployeeImage(existingEmployee.employee_img);
    }

    res.status(200).json({
      success: true,
      message: `Employee (${existingEmployee.employee_ID}) deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete employee.",
    });
  }
};
