import { Router } from "express";

import {
  createEmployeeBankDetailsController,
  getAllEmployeeBankDetailsController,
  getEmployeeBankDetailsController,
  updateEmployeeBankDetailsController,
  deleteEmployeeBankDetailsController,
} from "../controller/employeeBankDetailsController.js";

import { adminAuth } from "../middleware/authorization.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employee Bank Details
 *   description: Employee bank details management APIs
 */

/**
 * @swagger
 * /add-employee-bank-details:
 *   post:
 *     summary: Create employee bank details
 *     tags: [Employee Bank Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *             properties:
 *               employee_id:
 *                 type: string
 *                 description: Employee ID (e.g. MKRE0003 or integer database ID)
 *                 example: "MKRE0003"
 *               account_holder_name:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               account_number:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               branch_name:
 *                 type: string
 *               upi_id:
 *                 type: string
 *               pan_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bank details created successfully
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Bank details already exist
 */
router.post("/add-employee-bank-details", adminAuth, createEmployeeBankDetailsController);
router.post("/employee-bank-details", adminAuth, createEmployeeBankDetailsController);

/**
 * @swagger
 * /get-employee-bank-details:
 *   get:
 *     summary: Get all employee bank details
 *     tags: [Employee Bank Details]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details fetched successfully
 */
router.get("/get-employee-bank-details", adminAuth, getAllEmployeeBankDetailsController);
router.get("/employee-bank-details", adminAuth, getAllEmployeeBankDetailsController);

/**
 * @swagger
 * /get-employee-bank-details/{employeeId}:
 *   get:
 *     summary: Get bank details by employee database ID
 *     tags: [Employee Bank Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     responses:
 *       200:
 *         description: Bank details fetched successfully
 *       404:
 *         description: Bank details not found
 */
router.get("/get-employee-bank-details/:employeeId", adminAuth, getEmployeeBankDetailsController);
router.get("/employee-bank-details/:employeeId", adminAuth, getEmployeeBankDetailsController);

/**
 * @swagger
 * /edit-employee-bank-details/{employeeId}:
 *   put:
 *     summary: Update employee bank details
 *     tags: [Employee Bank Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_holder_name:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               account_number:
 *                 type: string
 *               ifsc_code:
 *                 type: string
 *               branch_name:
 *                 type: string
 *               upi_id:
 *                 type: string
 *               pan_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bank details updated successfully
 *       404:
 *         description: Bank details not found
 */
router.put("/edit-employee-bank-details/:employeeId", adminAuth, updateEmployeeBankDetailsController);
router.patch("/edit-employee-bank-details/:employeeId", adminAuth, updateEmployeeBankDetailsController);
router.put("/employee-bank-details/:employeeId", adminAuth, updateEmployeeBankDetailsController);
router.patch("/employee-bank-details/:employeeId", adminAuth, updateEmployeeBankDetailsController);

/**
 * @swagger
 * /delete-employee-bank-details/{employeeId}:
 *   delete:
 *     summary: Delete employee bank details
 *     tags: [Employee Bank Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     responses:
 *       200:
 *         description: Bank details deleted successfully
 *       404:
 *         description: Bank details not found
 */
router.delete("/delete-employee-bank-details/:employeeId", adminAuth, deleteEmployeeBankDetailsController);
router.delete("/employee-bank-details/:employeeId", adminAuth, deleteEmployeeBankDetailsController);

export default router;
