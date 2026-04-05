import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { useState } from "react";

import type { CompletionProvider } from "./query-input";
import * as QueryInput from "./query-input";

const meta = {
  component: QueryInput.Root,
} satisfies Meta<typeof QueryInput.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleLabels = [
  { name: "bug", color: { R: 252, G: 41, B: 41 } },
  { name: "enhancement", color: { R: 163, G: 230, B: 53 } },
  { name: "documentation", color: { R: 30, G: 80, B: 160 } },
  { name: "help wanted", color: { R: 0, G: 150, B: 136 } },
  { name: "wontfix", color: { R: 200, G: 200, B: 200 } },
];

const sampleAuthors = [
  { displayName: "Jane Doe", login: "janedoe" },
  { displayName: "Bob Smith", login: "bobsmith" },
  { displayName: "Alice Wu", login: "alicewu" },
];

const providers: CompletionProvider[] = [
  {
    prefix: "label:",
    highlightClass: "text-yellow-600 dark:text-yellow-500",
    getSuggestions: (query) =>
      sampleLabels
        .filter((l) => query === "" || l.name.toLowerCase().includes(query.toLowerCase()))
        .map((l) => ({
          value: l.name.includes(" ") ? `"${l.name}"` : l.name,
          label: l.name,
          icon: (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: `rgb(${l.color.R},${l.color.G},${l.color.B})` }}
            />
          ),
        })),
  },
  {
    prefix: "author:",
    highlightClass: "text-blue-600 dark:text-blue-400",
    getSuggestions: (query) =>
      sampleAuthors
        .filter(
          (a) =>
            query === "" ||
            a.displayName.toLowerCase().includes(query.toLowerCase()) ||
            a.login.toLowerCase().includes(query.toLowerCase()),
        )
        .map((a) => ({
          value: a.login,
          label: a.displayName,
          description: `@${a.login}`,
        })),
  },
];

export const Default: Story = {
  args: { children: null, value: "", onChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("status:open");
    return (
      <QueryInput.Root
        value={value}
        onChange={setValue}
        onSubmit={() => {}}
        providers={providers}
      >
        <QueryInput.Icon><Search /></QueryInput.Icon>
        <QueryInput.Input placeholder="status:open author:… label:…" />
        <QueryInput.Completions />
      </QueryInput.Root>
    );
  },
};

export const WithFilters: Story = {
  args: { children: null, value: "", onChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState('status:open label:bug author:janedoe fix login');
    return (
      <QueryInput.Root
        value={value}
        onChange={setValue}
        onSubmit={() => {}}
        providers={providers}
      >
        <QueryInput.Icon><Search /></QueryInput.Icon>
        <QueryInput.Input placeholder="status:open author:… label:…" />
        <QueryInput.Completions />
      </QueryInput.Root>
    );
  },
};

export const SyntaxOnly: Story = {
  args: { children: null, value: "", onChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("status:open label:bug");
    return (
      <QueryInput.Root value={value} onChange={setValue} onSubmit={() => {}}>
        <QueryInput.Icon><Search /></QueryInput.Icon>
        <QueryInput.Input placeholder="Search…" />
      </QueryInput.Root>
    );
  },
};

const asyncProviders: CompletionProvider[] = [
  {
    prefix: "label:",
    highlightClass: "text-yellow-600 dark:text-yellow-500",
    getSuggestions: async (query) => {
      await new Promise((r) => setTimeout(r, 500));
      return sampleLabels
        .filter((l) => query === "" || l.name.toLowerCase().includes(query.toLowerCase()))
        .map((l) => ({
          value: l.name.includes(" ") ? `"${l.name}"` : l.name,
          label: l.name,
        }));
    },
  },
];

export const AsyncCompletions: Story = {
  args: { children: null, value: "", onChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <QueryInput.Root
        value={value}
        onChange={setValue}
        onSubmit={() => {}}
        providers={asyncProviders}
      >
        <QueryInput.Icon><Search /></QueryInput.Icon>
        <QueryInput.Input placeholder="Type label: to see async loading…" />
        <QueryInput.Completions />
      </QueryInput.Root>
    );
  },
};
