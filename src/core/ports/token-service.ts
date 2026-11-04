export interface TokenService {
  sign(payload: { userId: number }): Promise<string>;
  verify(token: string): Promise<{ userId: number } | null>;
}