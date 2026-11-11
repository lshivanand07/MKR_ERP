
import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

import {
  getAdminById,
  updateAdmin,
  deleteAdmin,
  type AdminUpdateData,
} from "../models/adminModel.js";



// ==========================================
// DELETE PROFILE IMAGE FROM UPLOAD FOLDER
// ==========================================
const removeProfileImage = async (
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
    "adminprofile",
    fileName
  );

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== "ENOENT") {
      console.error("Profile image deletion failed:", error);
    }
  }
};

// ==========================================
// GET LOGGED-IN ADMIN PROFILE
// ==========================================
export const getAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number((req as any).user.id);
    console.log("admin id: ",id)

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const admin = await getAdminById(id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
    });
  }
};

// ==========================================
// UPDATE LOGGED-IN ADMIN PROFILE
// ==========================================
export const editAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadedImage = req.file?.filename;

  try {
    const id = Number((req as any).user.id);

    if (!id) {
      if (uploadedImage) {
        await removeProfileImage(uploadedImage);
      }

      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    // Get existing admin
    const existingAdmin = await getAdminById(id);

    if (!existingAdmin) {
      if (uploadedImage) {
        await removeProfileImage(uploadedImage);
      }

      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    const updateData: AdminUpdateData = {};

    // First name
    if (req.body.first_name !== undefined) {
      const firstName = String(req.body.first_name).trim();

      if (!firstName) {
        if (uploadedImage) {
          await removeProfileImage(uploadedImage);
        }

        res.status(400).json({
          success: false,
          message: "First name cannot be empty",
        });
        return;
      }

      updateData.first_name = firstName;
    }

    // Last name
    if (req.body.last_name !== undefined) {
      updateData.last_name = String(req.body.last_name).trim();
    }

    // Phone
    if (req.body.phone !== undefined) {
      updateData.phone = String(req.body.phone).trim();
    }

    // Email
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        if (uploadedImage) {
          await removeProfileImage(uploadedImage);
        }

        res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
        return;
      }

      updateData.email = email;
    }

    // Profile image
    if (req.file) {
      updateData.profile_image =
        `uploads/adminprofile/${req.file.filename}`;
    }

    // Do not allow self-profile role changes
    if (req.body.role !== undefined) {
      if (uploadedImage) {
        await removeProfileImage(uploadedImage);
      }

      res.status(403).json({
        success: false,
        message: "You cannot change your role from your profile",
      });
      return;
    }

    // Check whether there is anything to update
    if (Object.keys(updateData).length === 0) {
      if (uploadedImage) {
        await removeProfileImage(uploadedImage);
      }

      res.status(400).json({
        success: false,
        message: "Please provide at least one field or profile image to update",
      });
      return;
    }

    // Update database
    await updateAdmin(id, updateData);

    // Fetch updated admin
    const updatedAdmin = await getAdminById(id);

    // Remove previous image after successful database update
    if (
      req.file &&
      existingAdmin.profile_image &&
      existingAdmin.profile_image !== updatedAdmin?.profile_image
    ) {
      await removeProfileImage(existingAdmin.profile_image);
    }

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    // Remove newly uploaded image if update fails
    if (uploadedImage) {
      await removeProfileImage(uploadedImage);
    }

    const dbError = error as { code?: string };

    if (dbError.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
    });
  }
};

// ==========================================
// DELETE ADMIN BY ID
// ==========================================
export const removeAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
      return;
    }

    const existingAdmin = await getAdminById(id);

    if (!existingAdmin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    await deleteAdmin(id);

    // Remove profile image after database deletion
    await removeProfileImage(existingAdmin.profile_image);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
    });
  }
};
