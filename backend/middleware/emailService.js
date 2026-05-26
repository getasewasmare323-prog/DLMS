const nodemailer = require("nodemailer");
let transporter;
let usingTestAccount = false;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✅ Email service configured with SMTP host.");
    return transporter;
  }

  if (
    process.env.EMAIL_SERVICE &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✅ Email service configured with provider.");
    return transporter;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✅ Email service configured with Gmail fallback.");
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  usingTestAccount = true;
  console.warn(
    "⚠️ EMAIL_USER/EMAIL_PASS not configured. Using Ethereal test SMTP account for password reset emails.",
  );
  return transporter;
};

/**
 * Reusable function to send any email
 */
const sendMail = async (options) => {
  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: `"SMART ACCESS Support" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || options.email}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text:
        options.text ||
        String(options.html)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
    };

    const info = await transport.sendMail(mailOptions);
    console.log("✅ Email sent successfully: %s", info.messageId);

    let previewUrl;
    if (usingTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("📧 Preview email at:", previewUrl);
    }

    return { info, previewUrl };
  } catch (error) {
    console.error("❌ Email Service Error:", error.message);
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendMail;
