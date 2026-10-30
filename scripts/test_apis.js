const http = require('http');

function test(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('Testing /api/health...');
  const health = await test('/api/health');
  console.log('Health:', health);

  console.log('Testing /api/games...');
  const games = await test('/api/games');
  console.log('Games count:', games.data?.games?.length);
  games.data?.games?.forEach(g => console.log(` - ${g._id} | ${g.title} | ${g.totalQuestions} questions`));

  console.log('Testing /api/companies...');
  const companies = await test('/api/companies');
  console.log('Companies count:', companies.data?.companies?.length);

  console.log('Testing /api/internships...');
  const internships = await test('/api/internships');
  console.log('Internships count:', internships.data?.internships?.length);
}

run().catch(console.error);
