import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Form parse error" });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const attachments = []
        .concat(files.files || [])
        .map(file => ({
          filename: file.originalFilename,
          content: fs.readFileSync(file.filepath),
        }));

      await transporter.sendMail({
        from: `"QRGenPro" <${process.env.GMAIL_USER}>`,
        to: Array.isArray(fields.email) ? fields.email[0] : fields.email,
        subject: "Your QR Code is Ready",
        text: "Your QR code is ready. Please find the attached PNG, JPG, and PDF files.",
        html: emailHTML,
        attachments,
      });

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, message: "Email failed" });
    }
  });
}

const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your QR Code is Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 15px;">
        <table width="100%" max-width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:20px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">
                QRGenPro
              </h1>
              <p style="margin:6px 0 0;color:#dbeafe;font-size:13px;">
                Free QR Code Generator
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 10px;font-size:20px;color:#111827;">
                Your QR Code is Ready 🎉
              </h2>

              <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.6;">
                We've generated your QR code successfully.  
                You’ll find the QR code attached in the following formats:
              </p>

              <ul style="margin:0 0 20px;padding-left:18px;color:#374151;font-size:14px;">
                <li>PNG (High Quality)</li>
                <li>JPG</li>
                <li>PDF (Print Ready)</li>
              </ul>

              <div style="text-align:center;margin:30px 0;">
                <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;
                  padding:10px 18px;border-radius:999px;font-size:13px;">
                  🔒 Secure • No Tracking • No Ads
                </span>
              </div>

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you didn’t request this QR code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                Made with ❤️ by
                <a href="https://devhorizan.vercel.app"
                  style="color:#2563eb;font-weight:bold;text-decoration:none;">
                  DevHorizan
                </a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">
                © ${new Date().getFullYear()} QRGenPro. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
