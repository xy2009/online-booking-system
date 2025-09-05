
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // schema: "http://localhost:4000",
  schema: [
    "src/graphql/schemas/**/*.graphql",
    "src/graphql/schemas/**/*.gql"
  ],
  generates: {
    "src/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"]
    },
    "src/graphql/generated/graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

module.exports = config;
