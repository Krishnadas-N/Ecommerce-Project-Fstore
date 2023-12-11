const jwt = require('jsonwebtoken')
const fs = require('fs')

const PRIV_KEY = fs.readFileSync('id_rsa_priv.pem', 'utf8');

function issueJWT(user){
    const _id = user._id;
    const expiresIn = '1d';
    const payload = {
        sub:_id,
        iat:Date.now()
    };
    const signedToken = jwt.sign(payload,PRIV_KEY,{expiresIn: expiresIn, algorithm: 'RS256'})

                    // jsonwebtoken will take following parameters to sign a jwt
                    // payload: it will contains meta data about user for eg. id, iat, etc
                    // expiresIn: the life expentency of the jwt
                    // algorithm: algorithm with which the signature will be encoded

    return {
        token:signedToken,
        expiresIn: expiresIn
    }
}

module.exports.isssueJWT = issueJWT;