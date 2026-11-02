import { randomBytes } from 'crypto';

/**
 * Per-run generated values for tests that need credential-shaped inputs but must not
 * commit literal secrets. None of these are real credentials.
 */
export const TEST_PASSWORD = randomBytes(8).toString('hex');
export const TEST_ACCESS_TOKEN = randomBytes(8).toString('hex');
