import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../api/graphql/schema/*.graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        apolloReactHooksImportFrom: "@apollo/client/react",
        scalars: {
          Time: "string",
          Hash: "string",
          CombinedId: "string",
          Color: "{ R: number; G: number; B: number }",
        },
      },
    },
  },
};

export default config;
