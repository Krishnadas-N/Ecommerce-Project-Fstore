function coupongenerator(codeLength) {
    var coupon = '';
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < codeLength; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupon;
}

const generateCoupon = require('../coupongenerator'); // Import the module

const codeLength = 10; // Specify the desired code length
const coupon = generateCoupon(codeLength); // Generate a coupon with the specified length
console.log(coupon); // Print the generated coupon


module.exports = coupongenerator;
