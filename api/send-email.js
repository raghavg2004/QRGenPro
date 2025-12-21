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
        to: fields.email,
        subject: "Your QR Code Files",
        text: "Attached are your QR codes in PNG, JPG and PDF formats.",
        attachments,
      });

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, message: "Email failed" });
    }
  });
}
