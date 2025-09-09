import { connect, Cluster, Collection, Bucket, DocumentNotFoundError } from "couchbase";
import { logger } from "../common/utils/logger";

/**
 * CouchbaseDB singleton class to manage Couchbase connection and operations
 */
export class CouchbaseDB {
  private static _instance: CouchbaseDB;
  public cluster!: Cluster;
  public bucket!: Bucket;

  private constructor() {}

  public static get instance() {
    if (!this._instance) {
      this._instance = new CouchbaseDB();
    }
    return this._instance;
  }

  public async connect() {
    if (!this.cluster) {
      const DB_URL  =  `${process.env.DB_TYPE || 'couchbase'}://${process.env.DB_HOST || 'localhost'}`;
      const DB_USER = process.env.DB_USER || "Administrator";
      const DB_PASSWORD = process.env.DB_PASSWORD || "password";
      const DB_BUCKET = process.env.DB_BUCKET || "my_bucket";
      
      logger.info(`[Couchbase] Connecting to ${DB_URL}, bucket: ${DB_BUCKET}...`);

      this.cluster = await connect(DB_URL, {
        username: DB_USER,
        password: DB_PASSWORD,
      });
      this.bucket = this.cluster.bucket(DB_BUCKET);
      logger.info("[Couchbase] Connected!");
    }
  }

  /**
   * get Collection by scope and collection name instance method
   * @param scopeName <string> scope name
   * @param collectionName <string> collection name
   * @returns 
   */
  private __getCollection(scopeName: string, collectionName: string): Collection {
    return this.bucket.scope(scopeName).collection(collectionName);
  }

  /**
   * get Collection by scope and collection name static method
   * @param scope 
   * @param collection 
   * @returns 
   */
  public static getCollection(scope: string, collection: string) {
    return this.instance.__getCollection(scope, collection);
  }

  /**
   * insert or update document
   * @param scope <string> scope name
   * @param collection <string> collection name
   * @param key <string> document key
   * @param doc <any> document to upsert
   * @returns 
   */
  public static async upsert(
    scope: string,
    collection: string,
    key: string,
    doc: any,
    options?: any
  ) {
    await this.instance.connect();
    return this.getCollection(scope, collection).upsert(key, doc, options);
  }

  /**
   * get document by key
   * @param scope 
   * @param collection 
   * @param key 
   * @returns 
   */
  public static async get(scope: string, collection: string, key: string) {
    await this.instance.connect();
    try {
      const res = await this.getCollection(scope, collection).get(key);
      return res; // 找到则返回文档
    } catch (err) {
      if (err instanceof DocumentNotFoundError) {
        return undefined; // 没找到返回 undefined
      }
      throw err; // 其它错误抛出
    }
  }

  public static async exists(scope: string, collection: string, key: string) {
    await this.instance.connect();
    try {
      const re = await this.getCollection(scope, collection).exists(key);
      console.log('Document exists:', re);
      return true; // 找到则返回 true
    } catch (err) {
      if (err instanceof DocumentNotFoundError) {
        return false; // 没找到返回 false
      }
      throw err; // 其它错误抛出
    }
  }



  /**
   * execute N1QL query
   * @param queryString 
   * @param options 
   * @returns 
   */
  public static async query(queryString: string, options?: any) {
    await this.instance.connect();
    return this.instance.cluster.query(queryString, {
      timeout: 30000, // 30秒超时
      scanCap: 10000,   // 限制扫描数量
      profile: 'timings',
      useCBO: true,     // 使用基于成本的优化器
      ...options
    });
  }

  /**
   * delete document by key
   * @param scope 
   * @param collection 
   * @param key 
   * @returns 
   */
  public static async remove(
    scope: string,
    collection: string,
    key: string
  ) {
    await this.instance.connect();
    return this.getCollection(scope, collection).remove(key);
  }

  public static getCollectionFullName(scope: string, collection: string) {
    const bucket = process.env.DB_BUCKET || 'online-booking';
    return `\`${bucket}\`.\`${scope}\`.\`${collection}\``;
  }

  /**
   * disconnect from Couchbase
   */
  public static async disconnect() {
    if (this.instance.cluster) {
      await this.instance.cluster.close();
      logger.info("[Couchbase] Disconnected!");
    }
  }

  /**
   * ping the Couchbase cluster to check connectivity
   * @returns 
   */
  public static async ping() {
    await this.instance.connect();
    const result = await this.instance.cluster.ping();
    return result;
  }



}
