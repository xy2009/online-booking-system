
export const CREATE_TABLE =
`
mutation CreateTable ($input: CreateTableInput!){
    createTable(input: $input) {
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
    }
}
`;

export const UPDATE_TABLE =
`
mutation UpdateTable($id: ID!, $input: UpdateTableInput!) {
    updateTable(id: $id, input: $input) {
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