import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { SEED_USERS } from "./seed-data";

export type UserRole = "ADMIN" | "SEO_SPECIALIST";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "aura_patisserie_production_secure_jwt_secret_token_2026_xyz";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const SESSION_COOKIE_NAME = "aura_session";

export async function signSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: (payload.id as string) || (payload.sub as string),
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error if cookies cannot be accessed
  }
}

export async function authenticateCredentials(
  email: string,
  plainPassword: string
): Promise<SessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try PostgreSQL via Prisma
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (dbUser) {
      const isMatch = await bcrypt.compare(plainPassword, dbUser.passwordHash);
      if (isMatch) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as UserRole,
        };
      }
      return null;
    }
  } catch (err) {
    console.warn("Prisma user lookup unavailable, checking seed fallback credentials:", err);
  }

  // 2. Fallback to seed users if DB is connecting / offline
  const fallback = SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (fallback && fallback.plainPassword === plainPassword) {
    return {
      id: `fallback-${fallback.role.toLowerCase()}`,
      email: fallback.email,
      name: fallback.name,
      role: fallback.role,
    };
  }

  return null;
}
