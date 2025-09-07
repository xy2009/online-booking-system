
import { query, mutation, FIND_TABLES, GET_TABLE, CREATE_TABLE, UPDATE_TABLE } from '@booking/api-client';

export const createTable = async (tableData) => {
    return await mutation(CREATE_TABLE, { input: tableData });
};

export const updateTable = async (tableId, tableData) => {
    return await mutation(UPDATE_TABLE, { id: tableId, input: tableData });
};

export const disableTable = async (tableId) => {
    return await mutation(UPDATE_TABLE, { id: tableId, input: { status: 'unavailable' } });
};

export const findTables = async (variables = {}) => {
    return await query(FIND_TABLES, variables);
};

export const getTableById = async (tableId) => {
    return await query(GET_TABLE, { id: tableId });
}; 
