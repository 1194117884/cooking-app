/**
 * Environment variable validation utility
 * Ensures required environment variables are set before the application starts
 */

export function validateEnvironment(): void {
  const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please set these variables in your .env file or environment.'
    );
  }

  // Additional validations
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
      'WARNING: JWT_SECRET is shorter than 32 characters. ' +
      'Consider using a longer secret for better security.'
    );
  }
}