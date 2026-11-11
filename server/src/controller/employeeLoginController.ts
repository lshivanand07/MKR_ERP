import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  getEmployeeLoginCredential,
} from "../models/employeeLoginModel.js";

export const employeeLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawIdentifier =
      req.body.identifier ??
      req.body.email ??
      req.body.employee_id ??
      req.body.employee_ID;
    const { password } = req.body;

    const identifier = rawIdentifier ? String(rawIdentifier).trim() : "";

    // 1. Validate input
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "Email/Employee ID and password are required.",
      });
      return;
    }

    // 2. Get employee by email or employee_ID
    const employees = await getEmployeeLoginCredential(identifier);

    // 3. Check employee exists
    if (!employees.length) {
      res.status(401).json({
        success: false,
        message: "Email ID or Employee ID is not registered.",
      });
      return;
    }

    const employee = employees[0];

    // 4. Check employee status
    if (employee.status?.toLowerCase() !== "active") {
      res.status(403).json({
        success: false,
        message: "Your employee account is inactive. Please contact admin.",
      });
      return;
    }

    // 5. Compare password
    const isPasswordValid = await bcrypt.compare(
      String(password),
      employee.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
      return;
    }

    // 6. Check JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // 7. Generate JWT token
    const token = jwt.sign(
      {
        id: employee.id,
        employee_ID: employee.employee_ID,
        email: employee.email,
        role: employee.role,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    // 8. Login successful
    res.status(200).json({
      success: true,
      message: "Employee login successful.",
      token,
      user: {
        id: employee.id,
        employee_ID: employee.employee_ID,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
      },
    });

  } catch (error) {
    next(error);
  }
};
