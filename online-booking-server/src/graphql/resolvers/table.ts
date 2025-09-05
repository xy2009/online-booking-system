import { logger } from "../../common/utils/logger";
import { CreateTableInput, PaginationInput, Resolvers, Table, TableBookingFilterInput, TableLocation, TableStatus, UpdateTableInput } from "../generated/graphql";
import { createTable, deleteTable, findTables, getTableById, updateTable } from "../services/table";
import AppError from "../../common/errors";
import { TableInput } from "../types/table";


export const tableResolves: Resolvers = {
    Query: {
        tables: async (_: any, args: Partial<{ branchId?: string | null; filter?: any; pagination?: any }>, context: any) => {
            console.log("table resolver called with args:", args, "and context:", context);
            const { filter, pagination } = args || {};
            const { branchId } = filter;
            const safePagination = {
                page: pagination?.page && pagination.page > 0 ? pagination.page : 1,
                pageSize: pagination?.pageSize && pagination.pageSize > 0 && pagination.pageSize <= 100 ? pagination.pageSize : 10
            };
            logger.info(`Fetching table for branchId: ${branchId}, filter: ${filter}, pagination: ${safePagination}, user: ${context?.user.id}`);
            // Convert null name to undefined to match TableFilter type
            const safeFilter = {
                ...filter,
                name: filter?.name === null ? undefined : filter?.name,
                location: filter?.location === null ? undefined : filter?.location,
                status: filter?.status === null ? undefined : filter?.status,
                sizeMin: filter?.sizeMin === null ? undefined : filter?.sizeMin,
                sizeMax: filter?.sizeMax === null ? undefined : filter?.sizeMax,
            };
            console.log("Safe filter after processing:", safeFilter);
            if (!branchId) {
                throw new Error("branchId is required");
            }
            const result = await findTables(branchId, safeFilter, safePagination.page, safePagination.pageSize);

            // Map items to match generated GraphQL Table type
            const mappedItems = result.items.map((table: any) => ({
                ...table,
            }));

            return {
                ...result,
                items: mappedItems,
            };
        },
        table: async (_: any, args: { id: string }, context: any) => {
            const { id } = args;
            console.log('Fetching table with id:', id);
            // Fetch single table by ID
            const table = await getTableById(id);
            return table;
        },
        availableTables: async (_: any, args: Partial<{ filter?: TableBookingFilterInput | null; pagination?: PaginationInput | null }>, context: any) => {
            // Handle null filter (GraphQL InputMaybe can be null)
            const filter = args.filter === null ? undefined : args.filter;
            const pagination = args.pagination === null ? undefined : args.pagination;
            if (!filter) {
                throw AppError.paramsError("filter is required");
            }
            const { branchId, startTime, size } = filter;
            console.log("Fetching available tables for branchId:", branchId, "startTime:", startTime, "size:", size);
            if (!branchId) {
                throw AppError.paramsError("branchId is required");
            }
            if (!startTime || startTime <= 0) {
                throw AppError.paramsError("Valid bookingTime is required");
            }
            const now = Date.now();
            if (startTime && startTime < now) {
                throw AppError.paramsError("startTime must be in the future");
            }
            if (!size || size < 1) {
                throw AppError.paramsError("Size must be at least 1");
            }
            // Use pagination if provided, otherwise default values
            const page = pagination?.page && pagination.page > 0 ? pagination.page : 1;
            const pageSize = pagination?.pageSize && pagination.pageSize > 0 && pagination.pageSize <= 100 ? pagination.pageSize : 10;
            const saveFilter = {
                ...filter,
                name: filter?.name === null ? undefined : filter?.name,
                location: filter?.location === null ? undefined : filter?.location,
                size: size || 1,
                sizeMin: size,
            };
            logger.info(`Finding available tables for branchId: ${branchId}, filter: ${JSON.stringify(saveFilter)}, pagination: ${page}/${pageSize}, user: ${context?.user.id}`);
            // Call the service to find available tables
            const tables = await findTables(branchId, saveFilter, page, pageSize);
            // For simplicity, assuming all 'free' tables are available
            const availableTables = tables.items;
            // Map fields to match generated GraphQL Table type, especially nullable enums
            const mappedTables = availableTables.map((table: any) => ({
                ...table,
            }));
            // Return as TablePage type
            return {
                items: mappedTables as Table[],
                total: tables.total,
                page,
                pageSize,
            };
        }
    },
    Mutation: {
        createTable: async (_: any, { input }: { input: CreateTableInput }, context: any) => {
            console.log("Creating table with input:", input, "and context:", context);
            // Call the service to create the table
            const table = await createTable(input.branchId, input as TableInput, context?.user?.id);
            // Map fields to match generated GraphQL Table type, especially nullable enums
            return table as Table;
        },
        updateTable: async (_: any, { id, input }: {id: string, input: UpdateTableInput,}, context: any) => {
            console.log("Updating table with id:", id, "input:", input, "and context:", context);
            // Convert null fields to undefined to match TableInput type
            // if (input?.name === null || input?.name === undefined) {
            //     throw AppError.paramsError("Table name is required and cannot be null or undefined");
            // }
            if (input.hasOwnProperty('size') && Number(input?.size) < 1) {
                throw AppError.paramsError("Table size must be at least 1");
            }
            const table = await updateTable(id, input as TableInput, context?.user?.id);
            return table as Table;
        },
        deleteTable: async (_: any, { id }: { id: string }, context: any) => {
            console.log("Deleting table with id:", id, "and context:", context);
            // Call the service to delete the table
            // Note: You need to implement the deleteTable service function
            const success = await deleteTable(id, context?.user?.id);
            return success;
        }
    }
}