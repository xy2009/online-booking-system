

export const GREATE_BRANCH = 
`
mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(input: $input) {
        id
        name
        address
        openTime
        closeTime
        contactName
        contactNumber
        status
        createdAt
        updatedAt
        description
    }
    }
`;

export const UPDATE_BRANCH = 
`
mutation UpdateBranch($id: ID!, $input: UpdateBranchInput!){
    updateBranch(id: $id, input: $input) {
        id
        name
        address
        contactName
        contactNumber
        status
        description
        openTime
        closeTime
        createdAt
        updatedAt
    }
}
`;