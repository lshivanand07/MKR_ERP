import { Router } from "express";

import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
} from "../controller/employeeController.js";

import { upload } from "../middleware/upload.js";
import { adminAuth } from "../middleware/authorization.js";

const router = Router();
const employeeUpload = upload("employee");

// Apply admin authentication to all employee routes
// router.use(adminAuth);

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management APIs
 */

/**
 * @swagger
 * /add-employees:
 *   post:
 *     summary: Create employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               email:
 *                 type: string
 *               employee_img:
 *                 type: string
 *                 format: binary
 *               primary_phone:
 *                 type: string
 *               secondary_phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               date_of_joining:
 *                 type: string
 *                 format: date
 *               basic_salary:
 *                 type: number
 *               communication_address:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created and credentials emailed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Email or Employee ID already exists
 */
router.post(
  "/add-employees",
  employeeUpload.single("employee_img"),
  createEmployeeController
);
router.post(
  "/add-employee",
  employeeUpload.single("employee_img"),
  createEmployeeController
);
router.post(
  "/employees",
  employeeUpload.single("employee_img"),
  createEmployeeController
);

/**
 * @swagger
 * /get-employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee list
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get("/get-employees", getAllEmployeesController);
router.get("/employees", getAllEmployeesController);

/**
 * @swagger
 * /get-employees/{id}:
 *   get:
 *     summary: Get employee by ID or employee code (e.g. MKRE0003)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Employee not found
 */
router.get("/get-employees/:id", getEmployeeByIdController);
router.get("/get-employee/:id", getEmployeeByIdController);
router.get("/employees/:id", getEmployeeByIdController);

/**
 * @swagger
 * /edit-employees/{id}:
 *   put:
 *     summary: Update employee by ID or employee code (e.g. MKRE0003)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               email:
 *                 type: string
 *               employee_img:
 *                 type: string
 *                 format: binary
 *               primary_phone:
 *                 type: string
 *               secondary_phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               date_of_joining:
 *                 type: string
 *                 format: date
 *               basic_salary:
 *                 type: number
 *               communication_address:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Employee not found
 */
router.put(
  "/edit-employees/:id",
  employeeUpload.single("employee_img"),
  updateEmployeeController
);
router.patch(
  "/edit-employees/:id",
  employeeUpload.single("employee_img"),
  updateEmployeeController
);
router.put(
  "/edit-employee/:id",
  employeeUpload.single("employee_img"),
  updateEmployeeController
);
router.patch(
  "/edit-employee/:id",
  employeeUpload.single("employee_img"),
  updateEmployeeController
);
router.put(
  "/employees/:id",
  employeeUpload.single("employee_img"),
  updateEmployeeController
);

/**
 * @swagger
 * /delete-employees/{id}:
 *   delete:
 *     summary: Delete employee by ID or employee code (e.g. MKRE0003)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID (e.g. MKRE0003 or integer database ID)
 *         schema:
 *           type: string
 *           example: "MKRE0003"
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Employee not found
 */
router.delete("/delete-employees/:id", deleteEmployeeController);
router.delete("/delete-employee/:id", deleteEmployeeController);
router.delete("/employees/:id", deleteEmployeeController);

export default router;
