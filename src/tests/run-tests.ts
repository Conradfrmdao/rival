#!/usr/bin/env ts-node

import { runTests } from './api-test';

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Run the tests
runTests()
  .then(() => {
    console.log('\n🏁 Test suite completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });