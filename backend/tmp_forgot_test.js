const http = require('http');

const payload = JSON.stringify({ email: 'sakibansari3669@gmail.com' });

const req = http.request(
  {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  },
  (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log('BODY', body);
    });
  }
);

req.on('error', (err) => {
  console.error('ERROR', err.message);
});

req.write(payload);
req.end();
