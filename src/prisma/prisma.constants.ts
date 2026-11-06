/**
 * Injection token for the database URL. A `Symbol` cannot collide with
 * other providers that happen to use the same name.
 */
export const DATABASE_URL = Symbol('DATABASE_URL');
