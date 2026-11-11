
import { Router } from "express";

import {
  getAdmin,
  editAdmin,
  removeAdmin,
} from "../controller/adminController.js";
import { upload } from "../middleware/upload.js";

import authentication from "../middleware/authentication.js";
import { adminAuth } from "../middleware/authorization.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management APIs
 */


/**
 * @swagger
 * /get-admin-profile:
 *   get:
 *     summary: get-admin-profile
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: Admin fetched successfully
 *       400:
 *         description: Invalid admin ID
 *       404:
 *         description: Admin not found
 */
router.get("/get-admin-profile",  authentication, adminAuth, getAdmin);

/**
 * @swagger
 * /update-admin-profile:
 *   patch:
 *     summary: Update admin details and profile image
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email already exists
 */
router.patch(
  "/update-admin-profile",
  upload("adminprofile").single("profile_image"), authentication, adminAuth,
  editAdmin
);

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Delete admin
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       400:
 *         description: Invalid admin ID
 *       404:
 *         description: Admin not found
 */
router.delete("/admin/:id", authentication, adminAuth, removeAdmin);

export default router;
