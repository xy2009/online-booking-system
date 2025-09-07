import { omit } from "lodash";

import { logger } from "../../common/utils/logger";
import { BranchFilterInput, PaginationInput, Resolvers, CreateBranchInput, UpdateBranchInput, BranchStatus as GqlBranchStatus } from "../generated/graphql";
import { Branch } from "../types/branch";
import { branchServiceFind, createBranch, getBranchById, updateBranch, deleteBranch } from "../services/branch";
import { isSystemStaff } from "../middleware/permissionMiddleware";

export const branchResolves: Resolvers = {
    Query: {
        branches: 
            async (_: any, args: Partial<{ filter?: BranchFilterInput | null; pagination?: PaginationInput | null }>, context: any) => {
                const { filter, pagination } = args || {};
                const safePagination = {
                    page: pagination?.page && pagination.page > 0 ? pagination.page : 1,
                    pageSize: pagination?.pageSize && pagination.pageSize > 0 && pagination.pageSize <= 100 ? pagination.pageSize : 10
                };
                logger.info(`Fetching branches with filter: ${JSON.stringify(filter, null, 2)}, "and pagination:" ${JSON.stringify(safePagination, null, 2)}, "for user:" ${context?.user.id}`);
                // Convert null name to undefined to match BranchFilter type
                const safeFilter = {
                    ...filter,
                    name: filter?.name === null ? undefined : filter?.name,
                    status: filter?.status === null ? undefined : filter?.status
                };

                const result = await branchServiceFind(safeFilter, safePagination);
                let items = result.items.filter((branch): branch is Branch => branch !== undefined);
                if (!isSystemStaff(context?.user?.role)) {
                    items = items.map(branch => omit(branch, ['maintenanceLogs']) as Branch);
                }

                // Map status to the generated GraphQL enum for each branch
                const mappedItems = items.map(branch => ({
                    ...branch,
                    status: typeof branch.status === 'string'
                        ? GqlBranchStatus[branch.status.charAt(0).toUpperCase() + branch.status.slice(1) as keyof typeof GqlBranchStatus]
                        : branch.status,
                    description: branch.description !== undefined && branch.description !== null
                        ? String(branch.description)
                        : undefined
                }));

                return {
                    ...result,
                    items: mappedItems
                };
            },
        branch: async (_: any, args: { id: string }, context: any) => {
            const { id } = args;
            console.log('Fetching branch with id:', id);
            // Fetch single branch by ID
            const result = await getBranchById(id);
            return result;
        }
    },
    Mutation: {
        createBranch: async (_: any, { input }: { input: CreateBranchInput }, context: any) => {
            const { name, address, contactName, contactNumber, status } = input;
            // 创建新分店
            const result = await createBranch(
                { 
                    name, 
                    address, 
                    contactName,
                    contactNumber, 
                    status: status ?? 'active',
                    openTime: input.openTime,
                    closeTime: input.closeTime,
                },
                context?.user?.id
            );
            // Map status to the generated GraphQL enum
            return {
                ...result,
                id: result.id,
                status: (typeof result.status === 'string'
                    ? GqlBranchStatus[result.status.charAt(0).toUpperCase() + result.status.slice(1) as keyof typeof GqlBranchStatus]
                    : result.status),
                closeTime: result.closeTime,
                openTime: result.openTime,
                description: result.description !== undefined && result.description !== null
                    ? String(result.description)
                    : undefined
            };
        },
        updateBranch: async (_: any, { id, input }: { id: string; input: UpdateBranchInput }, context: any) => {
            console.log("Updating branch with input:", input, id);
            const { name, address, contactName, contactNumber, status } = input;
            // 更新分店信息
            const safeInput = {
                name: name === null ? undefined : name,
                address: address === null ? undefined : address,
                contactName: contactName === null ? undefined : contactName,
                contactNumber: contactNumber === null ? undefined : contactNumber,
                status: status === null ? undefined : status
            };
            const result = await updateBranch(
                id,
                safeInput,
                context?.user
            );
            // Map status to the generated GraphQL enum
            return {
                ...result,
                id: typeof result.id === 'function' ? result.id() : result.id,
                status: result.status
            };
        },
        deleteBranch: async (_parent, args: any, context: any) => {
            const { id } = args;
            // 软删除分店，实际是将status改为'deleted'
            return await deleteBranch(
                id,
                context?.user
            );
        }
    }
}