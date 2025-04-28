
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');


function client() {
  const clientId = 'AR5FvA5Q8e6U5wa9aKkNlb8Y6TMpCYgLypQpVmZiAfRkFEujP3Gk5XP-_qYSfRjMylB9kwPNVkldfq0Z';
  const clientSecret = 'EIWdGOmOs9wkfRXE30i-n9dt86DfZqaXJukZlG5Rzkc7-IiQkhXzD5Mo_Pm7-yXxVQuPPo4cqOvx9Olf';

  const environment = new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

  return paypalClient;
}

module.exports = client;
