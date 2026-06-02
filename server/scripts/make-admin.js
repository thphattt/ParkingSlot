/**
 * Script: Nâng cấp user thành admin
 * Chạy: node scripts/make-admin.js admin@parkingslot.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = process.argv[2] || 'admin@parkingslot.com';

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
    } else {
      console.log(`✅ Đã nâng cấp "${user.fullName}" (${user.email}) → role: admin`);
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
