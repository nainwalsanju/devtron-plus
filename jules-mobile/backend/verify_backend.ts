import http from 'http';

// Helper to make requests
function request(path: string, method: string = 'GET', body?: any, headers: any = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('Starting verification...');

  // Delay to let server start
  await new Promise(r => setTimeout(r, 2000));

  try {
    // 1. Login
    console.log('1. Testing Login...');
    const loginRes: any = await request('/auth/github', 'POST');
    if (loginRes.status !== 200) throw new Error('Login failed');
    const token = loginRes.body.token;
    console.log('   Login success. Token:', token);

    // 2. Get VMs
    console.log('2. Testing Get VMs...');
    const vmsRes: any = await request('/vms', 'GET', undefined, { Authorization: token });
    if (vmsRes.status !== 200) throw new Error('Get VMs failed');
    console.log('   Get VMs success. Count:', vmsRes.body.length);

    // 3. Add Local VM
    console.log('3. Testing Add Local VM...');
    const addLocalRes: any = await request('/vms', 'POST', {
        name: 'Test VM',
        type: 'local',
        host: 'mock',
        username: 'user'
    }, { Authorization: token });
    if (addLocalRes.status !== 201) throw new Error('Add Local VM failed: ' + JSON.stringify(addLocalRes.body));
    console.log('   Add Local VM success.');

    // 4. Test Pricing (Add Cloud VM on Free Plan)
    console.log('4. Testing Cloud VM Restriction (Free Plan)...');
    const addCloudRes: any = await request('/vms', 'POST', {
        name: 'Cloud VM',
        type: 'cloud',
        host: 'mock-cloud',
        username: 'root'
    }, { Authorization: token });

    if (addCloudRes.status === 403) {
        console.log('   Restriction worked (403 Forbidden).');
    } else {
        throw new Error('Restriction failed! Status: ' + addCloudRes.status);
    }

    // 5. Upgrade User
    console.log('5. Upgrading User to Pro...');
    await request('/users/me/upgrade', 'POST', undefined, { Authorization: token });

    // 6. Add Cloud VM (Pro Plan)
    console.log('6. Testing Cloud VM Addition (Pro Plan)...');
    const addCloudProRes: any = await request('/vms', 'POST', {
        name: 'Cloud VM Pro',
        type: 'cloud',
        host: 'mock-cloud',
        username: 'root'
    }, { Authorization: token });

    if (addCloudProRes.status === 201) {
        console.log('   Add Cloud VM success.');
    } else {
        throw new Error('Add Cloud VM failed on Pro plan: ' + JSON.stringify(addCloudProRes.body));
    }

    console.log('Verification Complete! All tests passed.');
    process.exit(0);

  } catch (err) {
      console.error('Verification Failed:', err);
      process.exit(1);
  }
}

run();
