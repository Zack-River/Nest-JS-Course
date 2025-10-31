import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const hash = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const hashedPassword = (await hash(password, salt, 32)) as Buffer;
  return `${salt}.${hashedPassword.toString('hex')}`;
}

export async function verifyPassword(
  storedPassword: string,
  suppliedPassword: string,
): Promise<boolean> {
  const [salt, storedHashedPassword] = storedPassword.split('.');

  if (!salt || !storedHashedPassword) {
    console.error('❌ Invalid stored password format:', storedPassword);
    return false;
  }

  const suppliedHashedPassword = (await hash(
    suppliedPassword,
    salt,
    32,
  )) as Buffer;
  const storedBuffer = Buffer.from(storedHashedPassword, 'hex');

  console.log('🧂 Salt:', salt);
  console.log('💾 Stored Hash:', storedHashedPassword);
  console.log('🔑 Supplied Hash:', suppliedHashedPassword.toString('hex'));

  if (storedBuffer.length !== suppliedHashedPassword.length) {
    console.error('❌ Length mismatch');
    return false;
  }

  const isMatch = timingSafeEqual(storedBuffer, suppliedHashedPassword);
  console.log('✅ Match:', isMatch);
  return isMatch;
}
