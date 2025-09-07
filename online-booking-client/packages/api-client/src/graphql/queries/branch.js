// export const GET_BRANCHES = `
//   query GetBranches($filter: BranchFilter) {
//     branches(filter: $filter) {
//       id
//       name
//       address
//       phone
//       openTime
//       closeTime
//       description
//       images
//       status
//     }
//   }
// `;

// export const GET_BRANCH_DETAIL = `
//   query GetBranchDetail($id: ID!) {
//     branch(id: $id) {
//       id
//       name
//       address
//       phone
//       openTime
//       closeTime
//       description
//       images
//       status
//       tables {
//         id
//         number
//         capacity
//         status
//         position
//       }
//     }
//   }
// `;

// export const GET_AVAILABLE_TABLES = `
//   query GetAvailableTables($branchId: ID!, $date: String!, $time: String!, $partySize: Int!) {
//     availableTables(branchId: $branchId, date: $date, time: $time, partySize: $partySize) {
//       id
//       number
//       capacity
//       position
//     }
//   }
// `;

// export const GET_TIME_SLOTS = `
//   query GetTimeSlots($branchId: ID!, $date: String!, $partySize: Int!) {
//     timeSlots(branchId: $branchId, date: $date, partySize: $partySize) {
//       time
//       available
//       tableCount
//     }
//   }
// `;


export const FIND_BRANCHES = `
 query Branches($filter: BranchFilterInput!, $pagination: PaginationInput!) {
    branches(filter: $filter, pagination: $pagination) {
        total
        page
        pageSize
        items {
            id
            name
            address
            contactName
            contactNumber
            status
            openTime
            closeTime
            description
            createdAt
        }
    }
}
`;

export const GET_BRANCH = `
  query Branch($id: ID!) {
      branch(id: $id) {
          id
          name
          address
          contactName
          contactNumber
          status
          openTime
          closeTime
          description
          createdAt
          updatedAt
          maintenanceLogs {
              performedAt
              backUp
              id
              accountId
          }
      }
  }
`;


