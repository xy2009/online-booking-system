import { logger } from "../../common/utils/logger";
import { isSystemStaff } from "../middleware/permissionMiddleware";
import { Resolvers, SysStaff, SysStaffInput, SysStaffUpdateInput, SysStaffFilter, PaginationInput } from "../generated/graphql";
import { 
  listSysStaffs, 
  deleteSysStaff, 
  updateSysStaff, 
  createSysStaff, 
  getSysStaffById 
} from "../services/sysStaff";
import AppError from "../../common/errors";

export const sysStaffResolves: Resolvers = {
  Query: {
    sysStaffs: async (_, { filter, pagination }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以查看员工列表
      if (!isSystemStaff(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      
      // 处理可能的 null 值
      const safeFilter = filter ? {
        name: filter.name === null ? undefined : filter.name,
        position: filter.position === null ? undefined : filter.position,
        status: filter.status === null ? undefined : filter.status,
        hireDateFrom: filter.hireDateFrom === null ? undefined : filter.hireDateFrom,
        hireDateTo: filter.hireDateTo === null ? undefined : filter.hireDateTo,
      } : {};

      const result = await listSysStaffs(safeFilter, page, pageSize);

      // 确保返回的数据符合 GraphQL schema
      const items = result.items.map((staff) => {
        return staff as SysStaff;
      });

      return {
        ...result,
        items,
      };
    },

    sysStaff: async (_, { id }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      const staff = await getSysStaffById(id);
      if (!staff) {
        throw AppError.notFound("Staff member not found");
      }

      // 系统管理员可以查看任何员工，普通员工只能查看自己的信息
      if (!isSystemStaff(user.role) && staff.accountId !== user.id) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      return staff as SysStaff;
    },
  },

  Mutation: {
    createSysStaff: async (_, { input }: { input: SysStaffInput }, { user }) => {
      logger.debug(`createSysStaff called with input: ${JSON.stringify(input)}, user: ${JSON.stringify(user)}`);
      
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以创建员工
      if (!isSystemStaff(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      // 处理可能的 null 值
      const safeInput = {
        ...input,
        contactNumber: input.contactNumber === null ? undefined : input.contactNumber,
        email: input.email === null ? undefined : input.email,
        status: input.status === null ? undefined : input.status,
      };

      // 这里需要提供 accountId 和 branchId，可以从用户上下文或输入中获取
      // 暂时使用用户的 ID 作为 accountId，实际应用中可能需要单独的输入字段
      const accountId = user.userId || user.id;
      const branchId = "default-branch"; // 这里应该从输入或用户上下文中获取实际的 branchId

      const newStaff = await createSysStaff(safeInput, accountId, branchId, user);
      logger.debug("New staff member created:", newStaff);
      
      return newStaff as SysStaff;
    },

    updateSysStaff: async (_, { id, input }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 处理可能的 null 值
      const safeInput = {
        ...input,
        name: input.name === null ? undefined : input.name,
        position: input.position === null ? undefined : input.position,
        contactNumber: input.contactNumber === null ? undefined : input.contactNumber,
        email: input.email === null ? undefined : input.email,
        status: input.status === null ? undefined : input.status,
      };

      const updatedStaff = await updateSysStaff(id, safeInput, user);
      if (!updatedStaff) {
        throw AppError.notFound("Staff member not found");
      }

      return updatedStaff as SysStaff;
    },

    deleteSysStaff: async (_, { id }, { user }) => {
      if (!user) throw AppError.unauthorized("Unauthorized");
      
      // 只有系统管理员可以删除员工
      if (!isSystemStaff(user.role)) {
        throw AppError.forbidden("Forbidden: insufficient permissions");
      }

      // 检查是否存在该员工
      const staff = await getSysStaffById(id);
      if (!staff) {
        throw AppError.notFound("Staff member not found");
      }

      // 不能删除自己的员工记录
      if (staff.accountId === user.id) {
        throw AppError.forbidden("Cannot delete your own staff record");
      }

      const success = await deleteSysStaff(id);
      return success;
    },
  }
};
