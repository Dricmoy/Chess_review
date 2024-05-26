const http = require('http');

const data = JSON.stringify({
  moves: ["e2e4", "e7e5", "g1f3"]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let response = '';

  res.on('data', (chunk) => {
    response += chunk;
  });

  res.on('end', () => {
    console.log('Response:', response);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
