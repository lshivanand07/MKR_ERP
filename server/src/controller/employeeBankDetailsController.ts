import { Request, Response } from "express";

import {
  checkEmployeeExists,
  createEmployeeBankDetails,
  getAllEmployeeBankDetails,
  getEmployeeBankDetailsByEmployeeId,
  updateEmployeeBankDetails,
  deleteEmployeeBankDetails,
} from "../models/employeeBankDetailsModel.js";

// ==========================================
// CREATE BANK DETAILS
// ==========================================
export const createEmployeeBankDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      employee_id,
      employee_ID,
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      upi_id,
      pan_number,
    } = req.body;

    const rawEmployeeId = employee_id ?? employee_ID;

    if (!rawEmployeeId || !String(rawEmployeeId).trim()) {
      res.status(400).json({
        success: false,
        message: "Valid employee_id (e.g. MKRE0003 or integer ID) is required.",
      });
      return;
    }

    const employee = await checkEmployeeExists(rawEmployeeId);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${rawEmployeeId}`,
      });
      return;
    }

    const existingDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    if (existingDetails) {
      res.status(409).json({
        success: false,
        message: `Bank details already exist for employee ${employee.employee_ID}.`,
      });
      return;
    }

    const bankDetailsId = await createEmployeeBankDetails({
      employee_id: employee.id,
      account_holder_name: account_holder_name ? String(account_holder_name).trim() : undefined,
      bank_name: bank_name ? String(bank_name).trim() : undefined,
      account_number: account_number ? String(account_number).trim() : undefined,
      ifsc_code: ifsc_code ? String(ifsc_code).trim() : undefined,
      branch_name: branch_name ? String(branch_name).trim() : undefined,
      upi_id: upi_id ? String(upi_id).trim() : undefined,
      pan_number: pan_number ? String(pan_number).trim() : undefined,
    });

    const bankDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    res.status(201).json({
      success: true,
      message: "Employee bank details created successfully.",
      data: {
        ...bankDetails,
        id: bankDetailsId,
      },
    });
  } catch (error) {
    console.error("Create employee bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create employee bank details.",
    });
  }
};

// ==========================================
// GET ALL BANK DETAILS
// ==========================================
export const getAllEmployeeBankDetailsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const bankDetails = await getAllEmployeeBankDetails();

    res.status(200).json({
      success: true,
      message: "Employee bank details fetched successfully.",
      count: bankDetails.length,
      data: bankDetails,
    });
  } catch (error) {
    console.error("Get employee bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employee bank details.",
    });
  }
};

// ==========================================
// GET BANK DETAILS BY EMPLOYEE ID OR EMPLOYEE CODE
// ==========================================
export const getEmployeeBankDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const param = String(req.params.employeeId) || String(req.params.id) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const employee = await checkEmployeeExists(param);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    const bankDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    if (!bankDetails) {
      res.status(404).json({
        success: false,
        message: `Bank details not found for employee ${employee.employee_ID}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Employee bank details fetched successfully.",
      data: bankDetails,
    });
  } catch (error) {
    console.error("Get employee bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employee bank details.",
    });
  }
};

// ==========================================
// UPDATE BANK DETAILS BY EMPLOYEE ID OR EMPLOYEE CODE
// ==========================================
export const updateEmployeeBankDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const param = String(req.params.employeeId) || String(req.params.id) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const employee = await checkEmployeeExists(param);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    const existingDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    if (!existingDetails) {
      res.status(404).json({
        success: false,
        message: `Bank details not found for employee ${employee.employee_ID}.`,
      });
      return;
    }

    const updated = await updateEmployeeBankDetails(
      employee.id,
      req.body
    );

    if (!updated) {
      res.status(400).json({
        success: false,
        message: "No valid bank details fields were provided.",
      });
      return;
    }

    const bankDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    res.status(200).json({
      success: true,
      message: "Employee bank details updated successfully.",
      data: bankDetails,
    });
  } catch (error) {
    console.error("Update employee bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update employee bank details.",
    });
  }
};

// ==========================================
// DELETE BANK DETAILS BY EMPLOYEE ID OR EMPLOYEE CODE
// ==========================================
export const deleteEmployeeBankDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const param = String(req.params.employeeId) || String(req.params.id) || String(req.params.employee_id);

    if (!param || !String(param).trim()) {
      res.status(400).json({
        success: false,
        message: "Employee ID or employee code is required.",
      });
      return;
    }

    const employee = await checkEmployeeExists(param);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: `Employee not found with ID/Code: ${param}`,
      });
      return;
    }

    const existingDetails =
      await getEmployeeBankDetailsByEmployeeId(employee.id);

    if (!existingDetails) {
      res.status(404).json({
        success: false,
        message: `Bank details not found for employee ${employee.employee_ID}.`,
      });
      return;
    }

    await deleteEmployeeBankDetails(employee.id);

    res.status(200).json({
      success: true,
      message: `Employee (${employee.employee_ID}) bank details deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete employee bank details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete employee bank details.",
    });
  }
};
