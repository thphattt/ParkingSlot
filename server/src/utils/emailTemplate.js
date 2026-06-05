const getEmailTemplate = (title, content, fullName, isWarning = false) => {
  // Nếu là thư nhắc nợ thì màu chủ đạo là Đỏ, bình thường thì màu Slate trầm ấm
  const accentColor = isWarning ? '#ef4444' : '#0f172a'; 
  const icon = isWarning ? '⚠️' : '🔔';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: ${accentColor};
          padding: 32px 40px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        .content {
          padding: 40px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .message-body {
          font-size: 15px;
          color: #475569;
          white-space: pre-wrap;
        }
        .signature {
          margin-top: 32px;
          font-weight: 500;
          color: #0f172a;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${icon} &nbsp; ${title}</h1>
        </div>
        <div class="content">
          <p class="greeting">Xin chào ${fullName},</p>
          <div class="message-body">${content}</div>
          <p class="signature">Trân trọng,<br>Ban Quản Lý Bãi Đỗ Xe</p>
        </div>
        <div class="footer">
          <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getEmailTemplate };