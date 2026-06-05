const { PayOS } = require('@payos/node');
const Payment = require('../models/Payment');

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// @desc    Tạo link thanh toán PayOS
// @route   POST /api/payos/create/:paymentId
exports.createPaymentLink = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('resident', 'fullName')
      .populate('slot', 'slotCode')
      .populate('contract', 'contractCode');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Hóa đơn đã thanh toán' });
    }

    // orderCode phải là số nguyên dương, unique
    // Dùng timestamp + random để tránh trùng
    const orderCode = Date.now() % 10000000000;

    // Trong môi trường dev, đổi giá trị thành 2000đ để test quét mã QR thật (tiền chuyển vào chính tài khoản của bạn)
    const testAmount = process.env.NODE_ENV === 'development' ? 2000 : payment.amount;

    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: testAmount,
      description: `Phi do xe T${payment.month} ${payment.year}`,
      returnUrl: `${process.env.CLIENT_URL}/payments?success=true&orderCode=${orderCode}`,
      cancelUrl: `${process.env.CLIENT_URL}/payments?cancelled=true`,
      items: [
        {
          name: `Phí đỗ xe - ${payment.slot?.slotCode || 'N/A'}`,
          quantity: 1,
          price: testAmount,
        },
      ],
    });

    // Lưu orderCode vào payment để webhook dùng
    payment.note = `PayOS orderCode: ${orderCode}`;
    await payment.save();

    res.json({
      success: true,
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode,
      },
    });
  } catch (error) {
    console.error('PayOS error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Webhook PayOS — xử lý kết quả thanh toán
// @route   POST /api/payos/webhook
exports.handleWebhook = async (req, res) => {
  try {
    // Với SDK v2, verify nằm trong payos.webhooks
    const webhookData = payos.webhooks.verify(req.body);

    if (webhookData.code === '00') {
      const orderCode = webhookData.orderCode;

      const payment = await Payment.findOne({
        note: `PayOS orderCode: ${orderCode}`,
        status: { $ne: 'paid' },
      });

      if (payment) {
        payment.status = 'paid';
        payment.paidDate = new Date();
        payment.paymentMethod = 'transfer';
        payment.note = `PayOS - Mã GD: ${webhookData.reference || orderCode}`;
        await payment.save();
        console.log(`✅ Payment marked as paid via PayOS (orderCode: ${orderCode})`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ success: false });
  }
};

// @desc    Kiểm tra trạng thái thanh toán
// @route   GET /api/payos/check/:orderCode
exports.checkPayment = async (req, res) => {
  try {
    // SDK v2 dùng paymentRequests.get
    const paymentInfo = await payos.paymentRequests.get(Number(req.params.orderCode));

    // Nếu đã thanh toán, cập nhật DB
    if (paymentInfo.status === 'PAID') {
      const payment = await Payment.findOne({
        note: `PayOS orderCode: ${req.params.orderCode}`,
        status: { $ne: 'paid' },
      });

      if (payment) {
        payment.status = 'paid';
        payment.paidDate = new Date();
        payment.paymentMethod = 'transfer';
        payment.note = `PayOS - Mã GD: ${paymentInfo.id || paymentInfo.orderCode}`;
        await payment.save();
      }
    }

    res.json({
      success: true,
      data: {
        status: paymentInfo.status,
        amount: paymentInfo.amount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};