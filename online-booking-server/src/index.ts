import app from "./app";
import { logger } from "./common/utils/logger";
import { getPrivateIPv4Addresses } from "./common/utils/network";
import { CouchbaseDB } from "./database/couchbaseUtils";

const bootstrap = async () => {
  
  logger.info("Starting server...");
  logger.info(`Connecting to Couchbase...`);
   // 确保 Couchbase 已连接成功
   await CouchbaseDB.instance.connect(); 
  const PORT = process.env.PORT || 4000;

  const server = app.listen(PORT, () => {
    const addresses = getPrivateIPv4Addresses();
    logger.info(`Server is running on:`);
    logger.info(`  http://localhost:${PORT}`);
    logger.info(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
    addresses.forEach((ip) => {
      logger.info(`  http://${ip}:${PORT}`);
      logger.info(`GraphQL endpoint at http://${ip}:${PORT}/graphql`);
    });
  });

  server.on("error", async (err: any) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`端口 ${PORT} 已被占用，服务启动失败。`);
    } else {
      logger.error("服务启动失败:", err);
    }
    await CouchbaseDB.disconnect;
    process.exit(1);
  });
};

bootstrap()
  .then()
  .catch((err) => {
    logger.error("Failed to start server:", err);
    process.exit(1);
  });
