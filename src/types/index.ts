export interface User {
  id: string;
  name: string;
  email: string;
  certificate(): Certificate;
  identity(): Identity | null;
}

export interface Certificate {
  publicKey: string;
  verify(message: string, signature: string): boolean;
}

export interface Identity {
  publicKey: string;
  privateKey: string;
  certificate(): Certificate;
  verify(message: string, signature: string): boolean;
  sign(message: string): string;
}
