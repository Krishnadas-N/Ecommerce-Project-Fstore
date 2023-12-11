//passport.js
const fs = require('fs')
const passport = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy
const path = require('path')
const User  = require('../models/userModel')



const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf-8')

const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['Authorization'];
    }
    console.log("token ");
    console.log(token);

    return token;
};


console.log(PUB_KEY)
const options = {
    jwtFromRequest: cookieExtractor,
    // we are using public key rather than private
    // because we are configuring verify peice of JWT
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const strategy = new JWTStrategy(options, (payload, done)=>{
    User.findOne({_id: payload.sub})
    .then((user)=>{
        if(user){
            return done(null, user);
        }else{
            return done(null, false);
        }
    })
    .catch(err=>{
        done(err, null)
    })
})



module.exports = (passport)=>{
    passport.use(strategy)
}




