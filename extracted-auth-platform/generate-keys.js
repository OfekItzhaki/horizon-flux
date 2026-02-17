const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

fs.writeFileSync(path.join(__dirname, 'public.pem'), publicKey);
fs.writeFileSync(path.join(__dirname, 'private.pem'), privateKey);

console.log('Keys generated successfully.');
console.log('Public Key path:', path.join(__dirname, 'public.pem'));
console.log('Private Key path:', path.join(__dirname, 'private.pem'));
