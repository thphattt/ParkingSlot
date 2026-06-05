const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // 1. Tạo "Người vận chuyển" (Transporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Sử dụng dịch vụ Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Thiết lập nội dung thư
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email, // Gửi cho ai
      subject: options.subject, // Tiêu đề thư
      html: options.message, // Nội dung thư (hỗ trợ code HTML để làm đẹp thư)
    };

    // 3. Thực hiện gửi
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ' + info.messageId);
  } catch (error) {
    console.error('❌ Lỗi gửi email: ', error);
    // Lưu ý: Chúng ta không throw error ở đây để tránh làm sập luồng tạo thông báo
    // Nếu gửi email thất bại, hệ thống vẫn lưu thông báo vào Database bình thường
  }
};

module.exports = sendEmail;