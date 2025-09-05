import { logger } from "../../common/utils/logger";
import { isAdmin, isSystemStaff } from "../middleware/permissionMiddleware";
import { Resolvers, Account, AccountInput, AccountUpdateInput, AccountFilter, PaginationInput } from "../generated/graphql";
import { 
  listAccounts, 
  deleteAccount, 
  updateAccount, 
  createAccount, 
  getAccountById 
} from "../services/account";
import AppError from "../../common/errors";

export const accountResolves: Resolvers = {
  Query: {
    accounts: async (_, { filter, pagination }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以查看所有账户
      if (!isSystemStaff(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      
      // 处理可能的 null 值
      const safeFilter = filter ? {
        mobile: filter.mobile === null ? undefined : filter.mobile,
        role: filter.role === null ? undefined : filter.role,
        status: filter.status === null ? undefined : filter.status,
        createdFrom: filter.createdFrom === null ? undefined : filter.createdFrom,
        createdTo: filter.createdTo === null ? undefined : filter.createdTo,
      } : {};

      const result = await listAccounts(safeFilter, page, pageSize, user);

      // 确保返回的数据符合 GraphQL schema
      const items = result.items.map((account) => {
        return account as Account;
      });

      return {
        ...result,
        items,
      };
    },

    account: async (_, { id }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      const account = await getAccountById(id);
      if (!account) {
        throw AppError.notFound("Account not found");
      }

      // 系统管理员可以查看任何账户，普通用户只能查看自己的账户
      if (!isAdmin(user.role) && account.id !== user.id) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      return account as Account;
    },
  },

  Mutation: {
    createAccount: async (_, { input }: { input: AccountInput }, { user }) => {
      logger.debug(`createAccount called with input: ${JSON.stringify(input)}, user: ${JSON.stringify(user)}`);
      
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以创建账户
      if (!isAdmin(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      // 处理可能的 null 值
      const safeInput = {
        ...input,
        role: input.role === null ? undefined : input.role,
        status: input.status === null ? undefined : input.status,
        username: input.username === null ? undefined : input.username,
      };

      const newAccount = await createAccount(safeInput);
      logger.debug("New account created:", newAccount);
      
      return newAccount as Account;
    },

    updateAccount: async (_, { id, input }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 处理可能的 null 值
      const safeInput = {
        ...input,
        password: input.password === null ? undefined : input.password,
        status: input.status === null ? undefined : input.status,
        username: input.username === null ? undefined : input.username,
      };

      const updatedAccount = await updateAccount(id, safeInput, user);
      if (!updatedAccount) {
        throw AppError.notFound("Account not found");
      }

      return updatedAccount as Account;
    },

    deleteAccount: async (_, { id }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以删除账户
      if (!isAdmin(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      // 不能删除自己的账户
      if (id === user.id) {
        throw AppError.forbidden("Cannot delete your own account");
      }

      const success = await deleteAccount(id);
      return success;
    },
  }
};
