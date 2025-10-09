// Initialize database - called when the server starts
import { initDatabase } from './db';

export function initializeDatabase() {
  try {
    initDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}
