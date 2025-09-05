

import { branchResolves } from "./branch";
import { tableResolves } from "./table";
import { bookingResolves } from "./booking";
import { accountResolves } from "./account";
import { sysStaffResolves } from "./sysStaff";

// 汇总所有 resolvers
export const resolvers = {

  Query: {
    ...branchResolves.Query,
    ...tableResolves.Query,
    ...bookingResolves.Query,
    ...accountResolves.Query,
    ...sysStaffResolves.Query,
  },
  Mutation: {
    ...branchResolves.Mutation,
    ...tableResolves.Mutation,
    ...bookingResolves.Mutation,
    ...accountResolves.Mutation,
    ...sysStaffResolves.Mutation,
    
  },
};
