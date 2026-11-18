export interface SessionTokenGenerator {
  generate(): { token: string; tokenHash: string };
  hash(token: string): string;
}