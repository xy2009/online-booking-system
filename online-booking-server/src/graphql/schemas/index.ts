
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import path from 'path';

// 加载所有 .graphql 文件
const typesArray = loadFilesSync(path.join(__dirname, './**/*.{graphql,gql}'));

// 合并为一个 typeDefs
export const typeDefs = mergeTypeDefs(typesArray);
// export const typeDefs = `
// type Query {
//     test: String
// }
// `

// const typesArray = loadFilesSync(path.join(__dirname, './branch.gql'));

// export const typeDefs = mergeTypeDefs(typesArray);
// mergeTypeDefs(typesArray, { all: true });
