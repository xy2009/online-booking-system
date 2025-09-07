import { query, mutation, 
  GREATE_BRANCH, UPDATE_BRANCH,
  FIND_BRANCHES, GET_BRANCH, 
} from '@booking/api-client';


export const createBranch = async (input) => {
    return await mutation(GREATE_BRANCH, { input });
};

export const updateBranch = async (id, input) => {
    return await mutation(UPDATE_BRANCH, { id, input });
};

export const findBranches = async (variables = {}) => {
    return await query(FIND_BRANCHES, variables);
};


export const getBranchById = async (id) => {
  return await query(GET_BRANCH, { id });  
};