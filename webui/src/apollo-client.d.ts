// oxlint-disable-next-line eslint-plugin-import(no-unassigned-import) -- declaration merging
import "@apollo/client";
import type { GraphQLCodegenDataMasking } from "@apollo/client/masking";

declare module "@apollo/client" {
  interface TypeOverrides extends GraphQLCodegenDataMasking.TypeOverrides {}
}
