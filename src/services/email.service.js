// src/services/email.service.js
import AppError from "../utils/AppError.js";

const isProduction = process.env.NODE_ENV === "production";

const createTransporter = async () => {
  try {
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    throw new AppError("Email service is not configured", 500);
  }
};

export const sendOtpEmail = async (email, otp) => {
  const message = `Your OTP Code is: ${otp}\nValid for 10 minutes`;

  if (!isProduction) {
    console.log(`OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = await createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@drip-store.local",
    to: email,
    subject: "Your OTP Code",
    text: message
  });
};
