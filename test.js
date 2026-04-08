const http = require('http');

const data = JSON.stringify({
  name: 'Test Profile',
  avatarId: 'hero',
  isKids: false,
  color: '#E50914'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/profiles/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
