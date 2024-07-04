# F_STORE - ECommerce Website for Gents Shirts

## Overview
F_STORE is an eCommerce website designed for selling gents shirts. This project demonstrates full-stack JavaScript development with Express.js, MongoDB, and responsive front-end web development. Key features include product browsing, a shopping cart, user authentication, secure checkout, and an admin panel.

## Features
- **Product Browsing:** Users can view a list of available shirts with details.
- **Shopping Cart:** Users can add shirts to their cart, update quantities, and remove items.
- **User Authentication:** Secure user registration and login system.
- **Secure Checkout:** Secure payment processing with integrated payment gateways.
- **Admin Panel:** Admins can manage products, view orders, and handle user queries.
- **Responsive Design:** Mobile-friendly design ensuring a seamless experience on all devices.

## Technologies Used
- **Frontend:**
  - HTML
  - CSS
  - JavaScript (ES6+)
  - Bootstrap
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
- **Authentication:**
  - Passport.js
  - JWT (JSON Web Tokens)
- **Payment Integration:**
  - Razorpay
- **Other Tools:**
  - Postman

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running
- Stripe/Razorpay account for payment integration

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Krishnadas-N/Ecommerce-Project-Fstore.git
   cd F_STORE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Run the application:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000`


## Folder Structure
```plaintext
F_STORE/
├── models/             # Mongoose models
├── routes/             # Express routes
├── controllers/        # Route handlers
├── views/              # EJS templates
├── public/             # Static files (CSS, JS, images)
├── config/             # Configuration files
├── .env                # Environment variables
├── app.js              # Main application file
├── package.json        # NPM dependencies and scripts
└── README.md           # Project documentation
```

## Contributing
Contributions are welcome! Please fork this repository and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Stripe](https://stripe.com/)
- [Razorpay](https://razorpay.com/)
