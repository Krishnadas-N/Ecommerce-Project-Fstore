const paypal = require('paypal-rest-sdk');
require('dotenv').config();

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_CLIENTSECRET
});