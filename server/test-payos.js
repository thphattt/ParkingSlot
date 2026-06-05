const { PayOS } = require('@payos/node');

const payos = new PayOS({
  clientId: '9391ad7a-ade7-4bc0-bef8-c1a03efc42fc',
  apiKey: 'cb7b052f-d3e0-4e5d-9747-68d6b2772649',
  checksumKey: '1b18806a42d6d56c7abd4003e884ae33bf099604e8465b18deee0e02f7c65037'
});

async function test() {
  try {
    const orderCode = Date.now() % 10000000000;
    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: 2000000,
      description: `Phi do xe T6/2026`,
      returnUrl: `http://localhost:5173/payments?success=true&orderCode=${orderCode}`,
      cancelUrl: `http://localhost:5173/payments?cancelled=true`,
      items: [
        {
          name: `Phí đỗ xe - N/A`,
          quantity: 1,
          price: 2000000,
        },
      ],
    });
    console.log(paymentLink);
  } catch (error) {
    console.error('PayOS error:', error);
  }
}

test();
