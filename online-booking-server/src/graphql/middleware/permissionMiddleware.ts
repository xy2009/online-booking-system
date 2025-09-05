import { rule, shield } from "graphql-shield";
import AppError from "../../common/errors";

const isAuthenticated = rule()(async (parent, args, context) => {
  return !!context.user;
});

const isAdminRule = rule()(async (parent, args, context) => {
  if (context.user?.role !== "admin") {
    return new Error("Forbidden: permission denied, please contact support.");
  }
  return context.user?.role === "admin";
});

export const isSystemStaff = (role: string) => {
  return ["admin", "staff"].includes(role);
}

export const isAdmin = (role: string) => {
  return role === "admin";
}

// 允许 admin 或 staff
const isAdminOrStaff = rule()(async (parent, args, context) => {
  return isSystemStaff(context.user?.role);
});

export const permissions = shield({
  Query: {
    branches: isAuthenticated,
    // other query...
    
  },
  Mutation: {
    createBranch: isAdminRule,
    // other mutation...
  },
},{
    fallbackError: async (thrownThing, parent, args, context, info) => {
      // 如果是你自定义的错误，直接返回
      if (thrownThing instanceof Error) return thrownThing;
      // 否则返回默认
      return new Error("Not Authorised!");
    }
  });