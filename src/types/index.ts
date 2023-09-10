/**
 * Identity 用于表示一个唯一的身份
 *
 * @property id 身份的唯一标识
 * @property publicKey 密码学公钥
 * @property privateKey 密码学私钥
 */
export interface Identity {
  id: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  verify(message: string, signature: string): Promise<boolean>;
  sign(message: string): Promise<string>;
}

/**
 * User 登记一个用户的信息
 */
export interface User extends Identity {
  name: string;
  email: string;
  signature: string;
}
