const axios = require('axios');
const qs = require('qs');

const INSTANCE_ID = 'instance177549';
const TOKEN = '5oijf709sybyihd5';

/**
 * Send WhatsApp Message
 */
const sendWhatsAppMessage =
async (phone, message) => {

  try {

    let cleanPhone = phone.replace(/\D/g, '');

    // If it's a 10-digit number, prepend 91 (India)
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const data = qs.stringify({
      token: TOKEN,
      to: `${cleanPhone}`, // UltraMsg usually takes the number with country code, no '+' needed for many instances or handles it internally
      body: message
    });

    const config = {
      method: 'post',
      url:
`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`,
      headers: {
        'Content-Type':
'application/x-www-form-urlencoded'
      },
      data
    };

    const response =
      await axios(config);

    console.log(
      '✅ WhatsApp Sent:',
      response.data
    );

    return true;

  } catch (err) {

    console.error(
      '❌ WhatsApp Error:',
      err.response?.data || err.message
    );

    return false;
  }
};

/**
 * Registration Message
 */
const sendRegistrationWhatsApp =
async (user) => {

  const message =
`Hello ${user.name}!

🎉 Welcome to Velvorax.

Your registration was successful.

Our team will review your account shortly.`;

  return await sendWhatsAppMessage(
    user.phone,
    message
  );
};

/**
 * Approval Message
 */
const sendApprovalWhatsApp =
async (user, status) => {

  const message =
status === 'Approved'
? `Hello ${user.name}!

✅ Your Velvorax account
has been APPROVED.

You can now login
and access your dashboard.`
: `Hello ${user.name},

Your account status is:

${status}`;

  return await sendWhatsAppMessage(
    user.phone,
    message
  );
};

module.exports = {
  sendWhatsAppMessage,
  sendRegistrationWhatsApp,
  sendApprovalWhatsApp
};