import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import type { RequestHandler } from "express";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";


import express from "express";
import { GraphQLError } from "graphql";
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

// Make sure './schemas' exists and exports 'typeDefs', or update the path below if your schema is elsewhere
import { typeDefs } from "../schemas";
import { resolvers } from "../resolvers";
import { permissions } from "./permissionMiddleware";

const app = express();

const httpServer = http.createServer(app);

// 详细的日志插件 - 已定义且会被使用
const detailedLoggingPlugin = {
  async requestDidStart(requestContext: any) {

    const requestId = Math.random().toString(36).substring(2, 10);
    const startTime = Date.now();

    console.log(`\n🟢 [${requestId}] === GRAPHQL REQUEST START ===`);
    console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`[${requestId}] Operation: ${requestContext.request.operationName || 'Anonymous'}`);
    console.log(`[${requestId}] Query: ${requestContext.request.query}`);
    console.log(`[${requestId}] Variables:`, JSON.stringify(requestContext.request.variables, null, 2));
    console.log(`[${requestId}] Headers:`, JSON.stringify(requestContext.request.http?.headers, null, 2));


    return {
      async parsingDidStart() {
        console.log(`[${requestId}] Parsing started`);
      },
      
      async validationDidStart() {
        console.log(`[${requestId}] Validation started`);
      },
      
      async didEncounterErrors(errors: any) {
        // console.log(`[${requestId}] 🚨 Errors encountered:`, errors);
      },

      async willSendResponse({ response }: any) {
        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] 📤 Sending response (${totalDuration}ms)`);
        
        if (response.errors && response.errors.length > 0) {
          console.log(`[${requestId}] ❌ Response contains ${response.errors.length} error(s):`);
          console.log(`[${requestId}] Errors:`, response.errors);
        } else {
          console.log(`[${requestId}] ✅ Response successful`);
        }
        
        console.log(`[${requestId}] 🔚 === REQUEST COMPLETE ===\n`);
      }
    };
  }
};


// 专门针对 null 错误的插件
const nullCheckPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }: any) {
        if (response.errors) {
          console.log('🚨 [nullCheckPlugin]: Detected errors in response:', response.errors);
        }
      }
    };
  }
};


export const createGraphQLMiddleware = async (): Promise<RequestHandler> => {
  const schema = applyMiddleware(
    makeExecutableSchema({ 
      typeDefs, 
      resolvers,
    }),
    permissions
  );

  const server = new ApolloServer<import("@apollo/server").BaseContext>({
    schema,
    // 可在这里配置 plugins 等
    introspection: true, // 确保 introspection 可用
    // debug: process.env.NODE_ENV === 'development', // 仅在开发环境启用调试
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }), // 必需插件
      // detailedLoggingPlugin, // 使用已定义的插件
      nullCheckPlugin        // 添加 null 检查插件
    ],
    formatError: (formattedError) => {
      console.log('📋 Formatted error details:');
      console.log('Message:', formattedError.message);
      console.log('Path:', formattedError.path);
      console.log('Extensions:', formattedError.extensions);
      return formattedError;
    }
  });

  await server.start();
  // 可在这里配置 context 认证
  return expressMiddleware(server, {
    context: async ({ req }) => ({
      user: (req as any).user, // 这样每个resolver都能拿到user
    }),
  }) as unknown as RequestHandler;
}; 
