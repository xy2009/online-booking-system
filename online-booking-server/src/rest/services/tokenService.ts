// src/services/tokenService.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
// Update the import path if the file exists elsewhere, for example:
import { KeyGenerator } from '../../common/utils/keyGenerator';
// Or create the file at '../common/utils/keyGenerator.ts' if it does not exist.

// Define TokenPayload type or import it from the correct location
export interface TokenPayload {
  sub: string;
  username?: string;
  [key: string]: any;
}

export class TokenService {
  private privateKey!: string;
  private publicKey!: string;
  private algorithm!: 'RS256' | 'RS384' | 'RS512';

  constructor() {
    // 初始化时加载或生成密钥
    this.initializeKeys();
  }

  private async initializeKeys(): Promise<void> {
    const keysDir = process.env.JWT_KEYS_DIR || './jwt-keys';
    
    try {
      // 尝试加载现有密钥
      const keyPair = await KeyGenerator.loadKeyPair(keysDir);
      
      if (KeyGenerator.validateKeyPair(keyPair.privateKey, keyPair.publicKey)) {
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
        this.algorithm = keyPair.algorithm;
        console.log('✅ Loaded existing JWT key pair');
      } else {
        throw new Error('Invalid key pair');
      }
    } catch {
      // 生成新的密钥对
      console.log('🔄 Generating new JWT key pair...');
      const keyPair = await KeyGenerator.generateKeyPair(2048);
      await KeyGenerator.saveKeyPair(keyPair, keysDir);
      
      this.privateKey = keyPair.privateKey;
      this.publicKey = keyPair.publicKey;
      this.algorithm = keyPair.algorithm;
      console.log('✅ Generated new JWT key pair');
    }
  }

  // 使用私钥签名（生成Token）
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: this.algorithm,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' as any,
      issuer: 'booking-system',
      audience: 'user',
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, tokenType: 'refresh' },
      this.privateKey,
      {
        algorithm: this.algorithm,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' as any,
        issuer: 'booking-system',
        audience: 'refresh',
      }
    );
  }

  // 使用公钥验证
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: 'booking-system',
        audience: 'user',
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: 'booking-system',
        audience: 'refresh',
      }) as TokenPayload & { tokenType: string };

      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // 获取公钥（提供给其他服务）
  getPublicKey(): string {
    return this.publicKey;
  }

  // 获取JWKS（JSON Web Key Set）端点
  getJWKS(): any {
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' });

    return {
      keys: [
        {
          kty: jwk.kty,
          use: 'sig',
          alg: this.algorithm,
          kid: this.getKeyId(),
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };
  }

  // 生成密钥ID（基于公钥指纹）
  private getKeyId(): string {
    const hash = crypto.createHash('sha256');
    hash.update(this.publicKey);
    return hash.digest('hex').substring(0, 16);
  }
}