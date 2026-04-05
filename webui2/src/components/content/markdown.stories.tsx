import type { Meta, StoryObj } from "@storybook/react-vite";

import { withRouter } from "@/../.storybook/decorators";

import { Markdown } from "./markdown";

const meta = {
  component: Markdown,
  decorators: [withRouter],
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicFormatting: Story = {
  args: {
    content: `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold**, *italic*, and \`inline code\`.

- Unordered list item 1
- Unordered list item 2
  - Nested item

1. Ordered list item 1
2. Ordered list item 2

> This is a blockquote.

---

[A link](https://example.com)`,
  },
};

export const CodeBlock: Story = {
  args: {
    content: `Here is a code block:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\``,
  },
};

export const GithubFlavored: Story = {
  args: {
    content: `## Task list

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Table

| Feature | Status | Priority |
|---------|--------|----------|
| Auth    | Done   | High     |
| Search  | WIP    | Medium   |
| Export  | Todo   | Low      |

## Strikethrough

This is ~~deleted~~ text.

## Emoji

:rocket: :bug: :sparkles:`,
  },
};

export const Comment: Story = {
  args: {
    content: `Fixed the issue by updating the query builder.

The problem was that \`buildQuery()\` wasn't escaping special characters in label names containing spaces.

\`\`\`diff
- const q = \`label:\${name}\`;
+ const q = \`label:"\${name}"\`;
\`\`\`

Closes #42.`,
  },
};
