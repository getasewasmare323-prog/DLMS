const nodemailer = require("nodemailer");

// Initialize the Transporter specifically for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Reusable function to send any email
 */
const sendMail = async (options) => {
  try {
    const mailOptions = {
      from: `"My App Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    // If this fails, it's usually because 2-Step verification is off
    // or the App Password is typed incorrectly.
    console.error("❌ Gmail Service Error:", error.message);
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendMail;
