const fs = require('fs');
const crypto = require('crypto');

// Generate a new RSA private key
const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key length
    publicKeyEncoding: {
        type: 'pkcs1', // Public key format
        format: 'pem',  // PEM format
    },
    privateKeyEncoding: {
        type: 'pkcs1', // Private key format
        format: 'pem',  // PEM format
    },
});

// Save the private key to a file
fs.writeFileSync('id_rsa_priv.pem', privateKey);

// Generate the corresponding public key from the private key
const publicKey = crypto.createPublicKey(privateKey);

// Save the public key to a file
fs.writeFileSync('id_rsa_pub.pem', publicKey.export({ type: 'pkcs1', format: 'pem' }));

console.log('Keys generated and saved as id_rsa_priv.pem and id_rsa_pub.pem');
