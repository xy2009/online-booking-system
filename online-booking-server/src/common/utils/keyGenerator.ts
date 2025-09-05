// src/common/utils/keyGenerator.ts
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  algorithm: 'RS256' | 'RS384' | 'RS512';
  generatedAt: Date;
}

export class KeyGenerator {
  // 生成新的RSA密钥对
  static async generateKeyPair(
    keySize: 2048 | 3072 | 4096 = 2048
  ): Promise<KeyPair> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'rsa',
        {
          modulusLength: keySize,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              privateKey,
              publicKey,
              algorithm: 'RS256',
              generatedAt: new Date(),
            });
          }
        }
      );
    });
  }

  // 保存密钥对到文件
  static async saveKeyPair(
    keyPair: KeyPair,
    directory: string
  ): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true });
      
      await fs.writeFile(
        path.join(directory, 'private.pem'),
        keyPair.privateKey
      );
      
      await fs.writeFile(
        path.join(directory, 'public.pem'),
        keyPair.publicKey
      );

      // 保存元数据
      const metaData = {
        algorithm: keyPair.algorithm,
        generatedAt: keyPair.generatedAt.toISOString(),
        keySize: keyPair.privateKey.includes('4096') ? 4096 : 
                keyPair.privateKey.includes('3072') ? 3072 : 2048,
      };

      await fs.writeFile(
        path.join(directory, 'key-meta.json'),
        JSON.stringify(metaData, null, 2)
      );
    } catch (error) {
      throw new Error(`Failed to save key pair: ${(error as Error).message}`);
    }
  }

  // 从文件加载密钥对
  static async loadKeyPair(directory: string): Promise<KeyPair> {
    try {
      const privateKey = await fs.readFile(
        path.join(directory, 'private.pem'),
        'utf8'
      );
      
      const publicKey = await fs.readFile(
        path.join(directory, 'public.pem'),
        'utf8'
      );

      let metaData: any = {};
      try {
        const metaContent = await fs.readFile(
          path.join(directory, 'key-meta.json'),
          'utf8'
        );
        metaData = JSON.parse(metaContent);
      } catch {
        // 元数据文件不存在也没关系
      }

      return {
        privateKey,
        publicKey,
        algorithm: metaData.algorithm || 'RS256',
        generatedAt: metaData.generatedAt ? new Date(metaData.generatedAt) : new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to load key pair: ${(error as Error).message}`);
    }
  }

  // 验证密钥对有效性
  static validateKeyPair(privateKey: string, publicKey: string): boolean {
    try {
      // 尝试使用密钥进行签名和验证
      const testData = 'test-signature-validation';
      
      // 创建签名
      const sign = crypto.createSign('SHA256');
      sign.update(testData);
      sign.end();
      const signature = sign.sign(privateKey, 'base64');

      // 验证签名
      const verify = crypto.createVerify('SHA256');
      verify.update(testData);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
  }
}