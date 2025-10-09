// Temporary script to test database connection
import { dbStatements } from './lib/db';

console.log('Testing database connection...');

// Test creating a user (use fresh IDs each time)
const testUserId = `test_user_${Date.now()}`;
const testUsername = `TestUser${Date.now()}`;

try {
  const result = dbStatements.createUser.run(testUserId, testUsername);
  console.log('Create user result:', result);
} catch (error) {
  console.log('Create user error:', error);
}

// Test get user
try {
  const user = dbStatements.getUser.get(testUserId);
  console.log('Get user result:', user);
} catch (error) {
  console.log('Get user error:', error);
}

// Test update balance
try {
  const updateResult = dbStatements.updateBalance.run(500, testUserId);
  console.log('Update balance result:', updateResult);
} catch (error) {
  console.log('Update balance error:', error);
}

// Test get user again
try {
  const user = dbStatements.getUser.get(testUserId);
  console.log('Get user after update:', user);
} catch (error) {
  console.log('Get user after update error:', error);
}
