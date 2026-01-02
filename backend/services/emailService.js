const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    console.log("📧 Sending verification email to:", email);

    const { data, error } = await resend.emails.send({
      from: "MySprays <noreply@mysprays.ca>",
      to: [email],
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
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw error;
    }

    console.log("✅ Verification email sent successfully!");
    return data;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    console.log("📧 Sending password reset email to:", email);

    const { data, error } = await resend.emails.send({
      from: "MySprays <noreply@mysprays.ca>",
      to: [email],
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
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw error;
    }

    console.log("✅ Password reset email sent successfully!");
    return data;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
