import path from 'path';

/**
 * File where `tests/setup/auth.setup.ts` saves the logged-in session.
 * Point `use.storageState` in playwright.config.ts here when enabling the `setup` project.
 * The folder is git-ignored (`playwright/.auth/`).
 */
export const STORAGE_STATE = path.join(process.cwd(), 'playwright/.auth/user.json');
