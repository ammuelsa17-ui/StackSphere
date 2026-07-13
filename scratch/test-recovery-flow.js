/**
 * Password Recovery Workflow Integration Test Script
 * This script runs a complete E2E sequence of API calls against the running local server
 * to test forgot-password, code-verification, rate-limiting, and reset-password endpoints.
 */

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PASSWORD RECOVERY WORKFLOW TESTS ===\n');

  const testUser = {
    name: 'Recovery Test User',
    email: 'recoverytest@example.com',
    password: 'password123'
  };

  // Step 1: Register test user
  console.log('Step 1: Registering test user...');
  try {
    const regResult = await makeRequest('/api/auth/register', 'POST', testUser);
    if (regResult.status === 201 || (regResult.status === 400 && regResult.data.error.includes('already exists'))) {
      console.log(' [PASS] User registered or already exists.');
    } else {
      console.log(` [FAIL] User registration failed: Status ${regResult.status}, Msg:`, regResult.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed to connect to local server. Make sure "npm run dev" is running on port 3000.', err.message);
    process.exit(1);
  }

  // Step 2: Request Forgot Password (First request)
  console.log('\nStep 2: Requesting password reset (First request)...');
  const resetReq1 = await makeRequest('/api/auth/forgot-password', 'POST', { email: testUser.email });
  if (resetReq1.status === 200 && resetReq1.data.success && resetReq1.data.verificationCode) {
    console.log(` [PASS] Verification code and token successfully generated. OTP: ${resetReq1.data.verificationCode}`);
  } else {
    console.log(' [FAIL] Forgot password request failed:', resetReq1.data);
    process.exit(1);
  }

  const { verificationCode, token: emailResetToken } = resetReq1.data;

  // Step 3: Request Forgot Password immediately (Second request - should be rate limited)
  console.log('\nStep 3: Requesting password reset immediately again (rate-limit check)...');
  const resetReq2 = await makeRequest('/api/auth/forgot-password', 'POST', { email: testUser.email });
  if (resetReq2.status === 429 && resetReq2.data.error && resetReq2.data.error.includes('already requested')) {
    console.log(` [PASS] Correctly rate-limited second request with status 429: "${resetReq2.data.error}"`);
  } else {
    console.log(` [FAIL] Expected rate limit status 429, got ${resetReq2.status}:`, resetReq2.data);
    process.exit(1);
  }

  // Step 4: Verify verification code with invalid OTP code
  console.log('\nStep 4: Submitting invalid verification code (OTP)...');
  const verifyInvalid = await makeRequest('/api/auth/verify-code', 'POST', { identity: testUser.email, code: '000000' });
  if (verifyInvalid.status === 400 && verifyInvalid.data.error && verifyInvalid.data.error.toLowerCase().includes('invalid')) {
    console.log(` [PASS] Correctly rejected invalid code: "${verifyInvalid.data.error}"`);
  } else {
    console.log(` [FAIL] Expected invalid code rejection status 400, got ${verifyInvalid.status}:`, verifyInvalid.data);
    process.exit(1);
  }

  // Step 5: Verify verification code with correct OTP code
  console.log('\nStep 5: Submitting correct verification code (OTP)...');
  const verifyValid = await makeRequest('/api/auth/verify-code', 'POST', { identity: testUser.email, code: verificationCode });
  if (verifyValid.status === 200 && verifyValid.data.success && verifyValid.data.resetToken) {
    console.log(' [PASS] Verification code successfully validated, returned reset token.');
  } else {
    console.log(` [FAIL] Expected success verification, got ${verifyValid.status}:`, verifyValid.data);
    process.exit(1);
  }

  const verifiedResetToken = verifyValid.data.resetToken;

  // Step 6: Complete reset password operation
  console.log('\nStep 6: Resetting password using the recovery token...');
  const newPassword = 'NewSecretPassword';
  const resetPassResult = await makeRequest('/api/auth/reset-password', 'POST', { token: verifiedResetToken, password: newPassword });
  if (resetPassResult.status === 200 && resetPassResult.data.success) {
    console.log(' [PASS] Password has been successfully reset.');
  } else {
    console.log(` [FAIL] Password reset failed: Status ${resetPassResult.status}, Msg:`, resetPassResult.data);
    process.exit(1);
  }

  console.log('\n=== ALL PASSWORD RECOVERY WORKFLOW TESTS PASSED ===');
}

runTests();
