export class SessionDto {
  userId: number;
  sessionToken?: string;
  expiresAt?: Date;
}
