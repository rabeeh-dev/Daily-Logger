import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-me'
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'rabeeh';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rabeeh123';

export async function verifyCredentials(username: string, pass: string) {
  if (username === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    return { username: ADMIN_USERNAME, name: 'Rabeeh' };
  }
  return null;
}

export async function createToken(payload: Record<string, unknown>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('life-os-token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  return payload;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
