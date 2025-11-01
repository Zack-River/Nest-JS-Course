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
) {
  const [salt, storedHashedPassword] = storedPassword.split('.');

  if (!salt || !storedHashedPassword) {
    return false;
  }

  const suppliedHashedPassword = (await hash(
    suppliedPassword,
    salt,
    32,
  )) as Buffer;
  const storedBuffer = Buffer.from(storedHashedPassword, 'hex');

  if (storedBuffer.length !== suppliedHashedPassword.length) {
    return false;
  }

  const isMatch = timingSafeEqual(storedBuffer, suppliedHashedPassword);
  return isMatch;
}
