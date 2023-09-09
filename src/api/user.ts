import { Certificate, Identity, User } from "../types";

interface SerializedUser {
  id: string;
  name: string;
  email: string;
  publicKey: string;
  privateKey: string;
}

class LocalUser implements User {
  id: string;
  name: string;
  email: string;
  publicKey: string;
  privateKey: string;

  constructor(params: SerializedUser) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;

    this.publicKey = params.publicKey;
    this.privateKey = params.privateKey;
  }

  certificate(): Certificate {
    return new LocalCertificate(this.publicKey);
  }

  identity(): Identity | null {
    throw new Error("Method not implemented.");
  }
}

class LocalCertificate implements Certificate {
  publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }
  verify(message: string, signature: string): boolean {
    throw new Error("Method not implemented.");
  }
}

class LocalIdentity implements Identity {
  publicKey: string;
  privateKey: string;

  constructor(publicKey: string, privateKey: string) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  certificate(): Certificate {
    throw new Error("Method not implemented.");
  }

  verify(message: string, signature: string): boolean {
    throw new Error("Method not implemented.");
  }

  sign(message: string): string {
    throw new Error("Method not implemented.");
  }
}

async function getCurrentUser(): Promise<User> {
  const item = localStorage.getItem("currentUser");
  if (!item) {
    throw new Error("获取当前用户失败");
  }

  return new LocalUser(JSON.parse(item) as SerializedUser);
}

function setCurrentUser(user: User) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      publicKey: user.identity()?.publicKey,
      privateKey: user.identity()?.privateKey,
    })
  );
}

async function register(name: string, email: string): Promise<User> {
  const { publicKey, privateKey } = { publicKey: "", privateKey: "" };
  return new LocalUser({ id: "", name, email, publicKey, privateKey });
}

async function login(name: string): Promise<User> {
  const item = localStorage.getItem("users");
  if (!item) {
    throw new Error("获取用户信息失败");
  }

  const users = JSON.parse(item) as Map<string, SerializedUser>;
  const user = users.get(name);
  if (!user) {
    throw new Error("指定的用户不存在");
  }

  return new LocalUser(user);
}

export default {
  getCurrentUser,
  setCurrentUser,
  register,
  login,
};
