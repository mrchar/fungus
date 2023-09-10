import { User } from "../types";

/**
 * 用于将用户以文本的形式进行保存
 */
interface UserRecordRaw {
  id: string;
  publicKey: string;
  privateKey: string;
  name: string;
  email: string;
  signature: string;
}

/**
 * 用户的实现
 * 使用ECDSA实现签名和验签
 */
class UserImpl implements User {
  id: string;
  name: string;
  email: string;
  signature: string;

  publicKey: CryptoKey;
  privateKey: CryptoKey;

  constructor(params: {
    id: string;
    name: string;
    email: string;
    signature: string;
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.signature = params.signature;

    this.publicKey = params.publicKey;
    this.privateKey = params.privateKey;
  }

  /**
   * 通过验证签名判断消息是否来自可信发信人
   *
   * @param message 消息原文
   * @param signature 消息签名
   * @returns 签名是否有效
   */
  async verify(message: string, signature: string): Promise<boolean> {
    const encoder = new TextEncoder();
    return await window.crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-384" },
      },
      this.publicKey,
      encoder.encode(signature),
      encoder.encode(message)
    );
  }

  /**
   * 对消息进行签名，以防止消息被伪造
   *
   * @param message 消息原文
   * @returns 签名
   */
  async sign(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const signatureArray = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-384" },
      },
      this.privateKey,
      encoder.encode(message)
    );

    return base64Encode(signatureArray);
  }
}

function base64Encode(ab: ArrayBuffer): string {
  return window.btoa(String.fromCharCode(...new Uint8Array(ab)));
}

function base64Decode(str: string): ArrayBuffer {
  // base64解码
  const decoded = window.atob(str);

  // 转换为ArrayBuffer
  const buf = new ArrayBuffer(decoded.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const privateKeyDer = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKey
  );

  return base64Encode(privateKeyDer);
}

async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const publicKeyDer = await window.crypto.subtle.exportKey("spki", publicKey);
  return base64Encode(publicKeyDer);
}

function importPrivateKey(pem: string) {
  const binaryDer = base64Decode(pem);

  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["sign"]
  );
}

function importPublicKey(pem: string) {
  const binaryDer = base64Decode(pem);

  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["verify"]
  );
}

async function generateUser(name: string, email: string): Promise<User> {
  // 检查环境
  if (!window.crypto.subtle) {
    throw new Error("请使用支持 Web Crypto API 的浏览器");
  }

  const subtle = window.crypto.subtle;

  // 生成密钥对
  const { publicKey, privateKey } = await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["sign", "verify"]
  );

  // 生成签名
  const encoded = new TextEncoder().encode(JSON.stringify({ name, email }));
  const signatureArray = await subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-384" },
    },
    privateKey,
    encoded
  );
  const signature = base64Encode(signatureArray);

  // 生成ID
  const publicKeyDer = await subtle.exportKey("spki", publicKey);
  const idArray = await subtle.digest("SHA-256", publicKeyDer);
  const id = base64Encode(idArray);

  return new UserImpl({ id, name, email, signature, publicKey, privateKey });
}

function loadUsers(): { [key: string]: UserRecordRaw } {
  const item = window.localStorage.getItem("users");
  if (!item) {
    return {};
  }

  return JSON.parse(item) as { [key: string]: UserRecordRaw };
}

function saveUsers(users: { [key: string]: UserRecordRaw }) {
  window.localStorage.setItem("users", JSON.stringify(users));
}

async function getCurrentUser(): Promise<User> {
  const item = window.localStorage.getItem("currentUser");
  if (!item) {
    throw new Error("获取当前用户失败");
  }

  const record = JSON.parse(item) as UserRecordRaw;

  return new UserImpl({
    id: record.id,
    name: record.name,
    email: record.email,
    signature: record.email,
    publicKey: await importPublicKey(record.publicKey),
    privateKey: await importPrivateKey(record.privateKey),
  });
}

async function setCurrentUser(user: User) {
  window.localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      publicKey: await exportPublicKey(user.publicKey),
      privateKey: await exportPrivateKey(user.privateKey),
      name: user.name,
      email: user.email,
      signature: user.signature,
    })
  );
}

async function register(name: string, email: string): Promise<User> {
  // 生成用户
  const user = await generateUser(name, email);

  // 记录用户
  const users = loadUsers();
  if (users[user.id]) {
    throw new Error("用户已经注册过了");
  }

  // 新增用户
  users[user.id] = {
    id: user.id,
    name: user.name,
    email: user.email,
    signature: user.signature,
    publicKey: await exportPublicKey(user.publicKey),
    privateKey: await exportPrivateKey(user.privateKey),
  };
  saveUsers(users);

  // 返回用户
  return user;
}

async function login(name: string): Promise<User> {
  const item = window.localStorage.getItem("users");
  if (!item) {
    throw new Error("获取用户信息失败");
  }

  const records = JSON.parse(item) as { [key: string]: UserRecordRaw };
  const record = records[name];
  if (!record) {
    throw new Error("指定的用户不存在");
  }

  return new UserImpl({
    id: record.id,
    name: record.name,
    email: record.email,
    signature: record.signature,
    publicKey: await importPublicKey(record.publicKey),
    privateKey: await importPrivateKey(record.privateKey),
  });
}

export default {
  getCurrentUser,
  setCurrentUser,
  register,
  login,
};
