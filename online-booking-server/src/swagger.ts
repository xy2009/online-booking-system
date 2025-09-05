// filepath: src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Online Booking API',
    version: '1.0.0',
    description: 'API documentation for Online Booking Server',
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/rest/controllers/*.ts'], // 你的API注释路径
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };