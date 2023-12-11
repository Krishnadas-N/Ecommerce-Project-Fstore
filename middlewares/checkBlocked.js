const User = require('../models/userModel'); // Import the User model

const blockMiddleware = async (req, res, next) => {
    try {
        // Check if the user is authenticated (you need to have user data in the request)
        if (!req.user) {
            return next();

        }
        const userid = req.user._id;
        const user = await User.findOne({_id:userid}); // Assuming you have the user data in req.user

        // Check if the user is blocked
        if (user.isBlocked) {
            console.log("uSER IS BLOCKED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
              req.session.BlockMessage = 'Hey You Are Blocked By Adminstrators';
              res.clearCookie('Authorization', {httpOnly: true});
              res.clearCookie('userloggedIn', { httpOnly: true });
             return res.redirect('/');
            }
      
          

        // If the user is not blocked, allow access to other pages
        return next();
    } catch (err) {
        console.error(err);
        next(err);
    }
};



module.exports = blockMiddleware;
