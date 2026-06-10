const twilio = require('twilio');
require('dotenv').config();

// ===============================
// TWILIO CONFIG
// ===============================

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// ===============================
// FORMAT PHONE NUMBER (SAFE)
// ===============================

const formatPhone = (phone) => {
  let cleanPhone = phone.replace(/\D/g, '');

  // India 10-digit fallback
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  return `+${cleanPhone}`;
};

// ===============================
// AUTO CALL FUNCTION
// ===============================

const makeAutoCall = async (phone, name) => {
  try {
    const toNumber = formatPhone(phone);

    const call = await client.calls.create({
      twiml: `
<Response>
  <Say voice="alice">
    Hello ${name}.
    Welcome to Velvorax.
    Your registration was successful.
    Our team will contact you shortly.
  </Say>
</Response>
      `,
      to: toNumber,
      from: TWILIO_NUMBER
    });

    console.log('✅ Call Success:', call.sid);
    return true;

  } catch (err) {
    console.log('❌ Call Error:', err.message);
    return false;
  }
};

// ===============================
// REGISTRATION CALL
// ===============================

const sendRegistrationCall = async (user) => {
  if (!user?.phone || !user?.name) {
    console.log('❌ Missing user data for registration call');
    return false;
  }

  return await makeAutoCall(user.phone, user.name);
};

// ===============================
// APPROVAL CALL
// ===============================

const sendApprovalCall = async (user) => {
  try {
    const toNumber = formatPhone(user.phone);

    const call = await client.calls.create({
      twiml: `
<Response>
  <Say voice="alice">
    Hello ${user.name}.
    Congratulations.
    Your Velvorax account has been approved.
    You can now login and access your dashboard.
  </Say>
</Response>
      `,
      to: toNumber,
      from: TWILIO_NUMBER
    });

    console.log('✅ Approval Call Success:', call.sid);
    return true;

  } catch (err) {
    console.log('❌ Approval Call Error:', err.message);
    return false;
  }
};

module.exports = {
  makeAutoCall,
  sendRegistrationCall,
  sendApprovalCall
};