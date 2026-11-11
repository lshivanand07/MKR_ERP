
import { Router } from "express";
import { employeeLoginController } from "../controller/employeeLoginController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employee Authentication
 *   description: Employee login APIs
 */

/**
 * @swagger
 * /employee-login:
 *   post:
 *     summary: Employee login using email OR employee ID
 *     tags: [Employee Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Employee email or Employee ID
 *                 example: MKRE0003
 *               email:
 *                 type: string
 *                 example: employee@gmail.com
 *               employee_id:
 *                 type: string
 *                 example: MKRE0003
 *               password:
 *                 type: string
 *                 example: Abc@123456
 *     responses:
 *       200:
 *         description: Employee login successful
 *       400:
 *         description: Email/Employee ID and password required
 *       401:
 *         description: Invalid credentials or unregistered account
 *       403:
 *         description: Employee account inactive
 */
router.post("/employee-login", employeeLoginController);

export default router;
