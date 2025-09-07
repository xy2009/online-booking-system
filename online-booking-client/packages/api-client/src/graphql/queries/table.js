
export const FIND_TABLES = 
`
query Tables($filter: TableFilterInput, $pagination: PaginationInput) {
    tables(filter: $filter, pagination: $pagination) {
        total
        page
        pageSize
        items {
            id
            branchId
            name
            size
            status
            location
            description
            tags
            createdAt
            updatedAt
            lastOccupiedAt
            lastCleanedAt
            createdBy
            updatedBy
            maxSize
            turntableCycle
        }
    }
}
`;

export const GET_TABLE =
`
query Table($id: ID!) {
    table(id: $id) {
        id
        branchId
        name
        size
        maxSize
        status
        location
        description
        tags
        createdAt
        updatedAt
        lastOccupiedAt
        lastCleanedAt
        createdBy
        updatedBy
        turntableCycle
    }
}
`;
