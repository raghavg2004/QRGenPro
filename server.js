// dyjn senq xxdv xsya  
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, icon.png, etc.)
app.use(express.static(path.join(__dirname)));

// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'projectonnet11@gmail.com', // your Gmail
        pass: 'dyjn senq xxdv xsya'  // app password
    }
});

// Endpoint to receive QR code files and email
app.post('/send-email', upload.array('files'), async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });

    // Prepare attachments
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path
    }));

    try {
        await transporter.sendMail({
            from: '"QRGenPro" <projectonnet11@gmail.com>',
            to: email,
            subject: 'Your QR Codes',
            text: 'Attached are your QR codes in PNG, JPG, and PDF formats.',
            attachments
        });

        // Delete uploaded files after sending
        req.files.forEach(file => fs.unlinkSync(file.path));

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
