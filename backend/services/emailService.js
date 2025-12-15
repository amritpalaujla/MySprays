const nodemailer = require("nodemailer");

// Create transporter function to ensure env vars are loaded
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Send verification email
async function sendVerificationEmail(email, token) {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Spray Management",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Spray Management!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; margin: 20px 0; 
                  background-color: #3b82f6; color: white; text-decoration: none; 
                  border-radius: 8px; font-weight: bold;">
          Verify Email
        </a>
        
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #3b82f6;">${verificationUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours.<br>
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

// Send password reset email
async function sendPasswordResetEmail(email, token) {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - Spray Management",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; margin: 20px 0; 
                  background-color: #ef4444; color: white; text-decoration: none; 
                  border-radius: 8px; font-weight: bold;">
          Reset Password
        </a>
        
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
