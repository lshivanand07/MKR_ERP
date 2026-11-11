
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendAdminLoginOTP = async (
  email: string,
  otp: string
): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials are not configured.");
  }

  await transporter.sendMail({
    from: `"ERP Attendance System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Admin Login OTP - ERP Attendance System",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
      ">
        <h2 style="color: #1d4ed8;">
          ERP Attendance System - Admin Login
        </h2>

        <p>We received a request to log in to your admin account.</p>

        <p>Your 6-digit login OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 15px;
          text-align: center;
          background: #f0f4ff;
          border-radius: 8px;
          margin: 20px 0;
          color: #1e3a8a;
        ">
          ${otp}
        </div>

        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>
          Do not share this OTP with anyone.
          If you did not request this login, please ignore this email.
        </p>

        <p>
          Regards,<br />
          <strong>ERP Attendance System Support</strong>
        </p>
      </div>
    `,
  });
};

interface EmployeeCredentialsEmail {
  name: string;
  employee_ID: string;
  email: string;
  password: string;
}

export const sendEmployeeCredentialsEmail = async ({
  name,
  employee_ID,
  email,
  password,
}: EmployeeCredentialsEmail): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials are not configured.");
  }

  await transporter.sendMail({
    from: `"ERP Attendance System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Employee Account Created - ERP Attendance System",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
      ">
        <h2 style="color: #1d4ed8;">
          ERP Attendance System - Employee Account
        </h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>Your employee account has been created successfully.</p>

        <p>Your login credentials are:</p>

        <div style="
          background: #f0f4ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        ">
          <p>
            <strong>Employee ID:</strong> ${employee_ID}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Password:</strong> ${password}
          </p>
        </div>

        <p>
          Please log in using these credentials and change your password
          after your first login.
        </p>

        <p>
          Do not share your login credentials with anyone.
        </p>

        <p>
          Regards,<br />
          <strong>ERP Attendance System Support</strong>
        </p>
      </div>
    `,
  });
};