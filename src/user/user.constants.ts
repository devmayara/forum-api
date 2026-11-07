import type { Prisma } from '../generated/prisma/client.js';

/** Scalar fields safe to expose in API responses. */
export const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
