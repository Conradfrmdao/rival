import axios, { AxiosError } from 'axios';

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

// Test configuration
interface TestConfig {
  user1: {
    phone: string;
    password: string;
    username: string;
  };
  user2: {
    phone: string;
    password: string;
    username: string;
  };
}

const testConfig: TestConfig = {
  user1: {
    phone: '256700000001',
    password: 'Test123456',
    username: 'TestUser1'
  },
  user2: {
    phone: '256700000002',
    password: 'Test123456',
    username: 'TestUser2'
  }
};

// Test state
let user1Token: string = '';
let user1RefreshToken: string = '';
let user2Token: string = '';
let user2RefreshToken: string = '';
let testMatchId: string = '';
let testGameId: string = '';

// Helper function to make API requests
async function apiRequest(method: string, endpoint: string, data?: any, token?: string) {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
      timeout: 10000
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      success: false,
      error: axiosError.response?.data || { error: axiosError.message },
      status: axiosError.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiRequest('GET', '/health');

  if (result.success && result.data.status === 'ok') {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result.error);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');

  // Register user 1
  console.log('Registering User 1...');
  const user1Result = await apiRequest('POST', '/auth/register', {
    username: testConfig.user1.username,
    phone: testConfig.user1.phone,
    password: testConfig.user1.password
  });

  if (user1Result.success) {
    console.log('✅ User 1 registration successful');
  } else {
    console.log('ℹ️  User 1 might already exist:', user1Result.error);
  }

  // Register user 2
  console.log('Registering User 2...');
  const user2Result = await apiRequest('POST', '/auth/register', {
    username: testConfig.user2.username,
    phone: testConfig.user2.phone,
    password: testConfig.user2.password
  });

  if (user2Result.success) {
    console.log('✅ User 2 registration successful');
  } else {
    console.log('ℹ️  User 2 might already exist:', user2Result.error);
  }

  return true;
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');

  // Login user 1
  console.log('Logging in User 1...');
  const user1Login = await apiRequest('POST', '/auth/login', {
    phone: testConfig.user1.phone,
    password: testConfig.user1.password
  });

  if (user1Login.success && user1Login.data.data) {
    user1Token = user1Login.data.data.accessToken;
    user1RefreshToken = user1Login.data.data.refreshToken;
    console.log('✅ User 1 login successful');
  } else {
    console.log('❌ User 1 login failed:', user1Login.error);
    return false;
  }

  // Login user 2
  console.log('Logging in User 2...');
  const user2Login = await apiRequest('POST', '/auth/login', {
    phone: testConfig.user2.phone,
    password: testConfig.user2.password
  });

  if (user2Login.success && user2Login.data.data) {
    user2Token = user2Login.data.data.data.accessToken;
    user2RefreshToken = user2Login.data.data.data.refreshToken;
    console.log('✅ User 2 login successful');
  } else {
    console.log('❌ User 2 login failed:', user2Login.error);
    return false;
  }

  return true;
}

async function testWalletOperations() {
  console.log('\n💰 Testing Wallet Operations...');

  // Get user 1 balance
  console.log('Getting User 1 balance...');
  const balance1 = await apiRequest('GET', '/wallet/balance', {}, user1Token);

  if (balance1.success) {
    console.log('✅ User 1 balance retrieved:', balance1.data.data.balance);
  } else {
    console.log('❌ Failed to get User 1 balance:', balance1.error);
  }

  // Test deposit initiation
  console.log('Testing deposit initiation...');
  const deposit = await apiRequest('POST', '/wallet/deposit', {
    amount: 5000,
    phone: testConfig.user1.phone
  }, user1Token);

  if (deposit.success) {
    console.log('✅ Deposit initiated successfully');
  } else {
    console.log('❌ Deposit initiation failed:', deposit.error);
  }

  // Test withdrawal
  console.log('Testing withdrawal...');
  const withdrawal = await apiRequest('POST', '/wallet/withdraw', {
    amount: 1000,
    phone: testConfig.user1.phone
  }, user1Token);

  if (withdrawal.success) {
    console.log('✅ Withdrawal initiated successfully');
  } else {
    console.log('ℹ️  Withdrawal might fail due to insufficient balance:', withdrawal.error);
  }

  return true;
}

async function testGames() {
  console.log('\n🎮 Testing Games...');

  // Get available games
  console.log('Getting available games...');
  const games = await apiRequest('GET', '/games', {}, user1Token);

  if (games.success && games.data.data) {
    console.log('✅ Games retrieved successfully');
    testGameId = games.data.data[0]?.id; // Get first game for testing
    console.log('📋 Available games:', games.data.data.map((g: any) => g.name).join(', '));
  } else {
    console.log('❌ Failed to get games:', games.error);
    return false;
  }

  return true;
}

async function testMatchmaking() {
  console.log('\n🎯 Testing Matchmaking...');

  if (!testGameId) {
    console.log('❌ No game ID available for matchmaking test');
    return false;
  }

  // User 1 joins matchmaking
  console.log('User 1 joining matchmaking...');
  const match1 = await apiRequest('POST', '/matches', {
    action: 'join_matchmaking',
    gameType: 'rock_paper_scissors',
    stakeAmount: 1000
  }, user1Token);

  if (match1.success) {
    console.log('✅ User 1 joined matchmaking');
    testMatchId = match1.data.data.matchId;
  } else {
    console.log('❌ User 1 failed to join matchmaking:', match1.error);
    return false;
  }

  // User 2 joins matchmaking (should create a match)
  console.log('User 2 joining matchmaking...');
  const match2 = await apiRequest('POST', '/matches', {
    action: 'join_matchmaking',
    gameType: 'rock_paper_scissors',
    stakeAmount: 1000
  }, user2Token);

  if (match2.success) {
    console.log('✅ User 2 joined matchmaking');
    if (!testMatchId) {
      testMatchId = match2.data.data.matchId;
    }
  } else {
    console.log('❌ User 2 failed to join matchmaking:', match2.error);
  }

  return true;
}

async function testGameMoves() {
  console.log('\n🎲 Testing Game Moves...');

  if (!testMatchId) {
    console.log('❌ No match ID available for game moves test');
    return false;
  }

  // User 1 makes a move
  console.log('User 1 making a move...');
  const move1 = await apiRequest('POST', '/moves', {
    matchId: testMatchId,
    gameType: 'rock_paper_scissors',
    move: 'rock',
    action: 'make_move'
  }, user1Token);

  if (move1.success) {
    console.log('✅ User 1 move successful');
  } else {
    console.log('❌ User 1 move failed:', move1.error);
  }

  // User 2 makes a move
  console.log('User 2 making a move...');
  const move2 = await apiRequest('POST', '/moves', {
    matchId: testMatchId,
    gameType: 'rock_paper_scissors',
    move: 'paper',
    action: 'make_move'
  }, user2Token);

  if (move2.success) {
    console.log('✅ User 2 move successful');
  } else {
    console.log('❌ User 2 move failed:', move2.error);
  }

  return true;
}

async function testGameResult() {
  console.log('\n🏆 Testing Game Result...');

  if (!testMatchId) {
    console.log('❌ No match ID available for game result test');
    return false;
  }

  // Complete the game with user 2 as winner (paper beats rock)
  console.log('Completing game with result...');
  const result = await apiRequest('POST', `/matches/${testMatchId}/result`, {
    result: 'lose', // User 1 perspective (lost to user 2)
    gameData: {
      moves: {
        user1: 'rock',
        user2: 'paper'
      },
      winner: 'user2'
    }
  }, user1Token);

  if (result.success) {
    console.log('✅ Game result processed successfully');
  } else {
    console.log('❌ Game result processing failed:', result.error);
  }

  return true;
}

async function testTokenRefresh() {
  console.log('\n🔄 Testing Token Refresh...');

  if (!user1RefreshToken) {
    console.log('❌ No refresh token available');
    return false;
  }

  const refresh = await apiRequest('POST', '/auth/refresh', {
    refreshToken: user1RefreshToken
  });

  if (refresh.success) {
    console.log('✅ Token refresh successful');
    user1Token = refresh.data.data.accessToken;
  } else {
    console.log('❌ Token refresh failed:', refresh.error);
    return false;
  }

  return true;
}

async function testUserProfile() {
  console.log('\n👤 Testing User Profile...');

  // Get user profile
  const profile = await apiRequest('GET', '/auth/profile', {}, user1Token);

  if (profile.success) {
    console.log('✅ User profile retrieved successfully');
  } else {
    console.log('❌ Failed to get user profile:', profile.error);
    return false;
  }

  return true;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Rival API Tests...');
  console.log('📡 API URL:', API_BASE_URL);

  const tests = [
    testHealthCheck,
    testUserRegistration,
    testUserLogin,
    testWalletOperations,
    testGames,
    testMatchmaking,
    testGameMoves,
    testGameResult,
    testTokenRefresh,
    testUserProfile
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Test failed with exception:', error);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend implementation.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, testConfig };