import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";

import { Markdown } from "@/components/content/markdown";
import { Textarea } from "@/components/ui/textarea";
import { withRouter } from "@/../.storybook/decorators";

import * as WritePreview from "./write-preview";

const meta = {
  component: WritePreview.Root,
  decorators: [withRouter],
} satisfies Meta<typeof WritePreview.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  args: { children: null },
  render: () => {
    const [message, setMessage] = useState("Hello **world**!");
    return (
      <WritePreview.Root hasContent={!!message.trim()}>
        <WritePreview.Tabs className="mb-2" />
        <WritePreview.WriteSlot>
          <Textarea
            placeholder="Describe the issue…"
            className="min-h-[200px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </WritePreview.WriteSlot>
        <WritePreview.PreviewSlot>
          <div className="border-input min-h-[200px] rounded-md border px-3 py-2">
            <Markdown content={message} />
          </div>
        </WritePreview.PreviewSlot>
      </WritePreview.Root>
    );
  },
};

export const Controlled: Story = {
  args: { children: null },
  render: () => {
    const [message, setMessage] = useState("");
    const [preview, setPreview] = useState(false);
    return (
      <WritePreview.Root hasContent={!!message.trim()} preview={preview} onPreviewChange={setPreview}>
        <WritePreview.Tabs className="mb-2" />
        <WritePreview.WriteSlot>
          <Textarea
            placeholder="Leave a comment…"
            className="min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </WritePreview.WriteSlot>
        <WritePreview.PreviewSlot>
          <div className="min-h-[120px] px-4 py-3">
            <Markdown content={message} />
          </div>
        </WritePreview.PreviewSlot>
      </WritePreview.Root>
    );
  },
};

export const Empty: Story = {
  args: { children: null },
  render: () => (
    <WritePreview.Root hasContent={false}>
      <WritePreview.Tabs className="mb-2" />
      <WritePreview.WriteSlot>
        <Textarea placeholder="Preview is disabled until you type something…" className="min-h-[120px]" />
      </WritePreview.WriteSlot>
      <WritePreview.PreviewSlot>
        <div className="min-h-[120px] px-4 py-3">Nothing to preview</div>
      </WritePreview.PreviewSlot>
    </WritePreview.Root>
  ),
};

export const TabSwitching: Story = {
  args: { children: null },
  render: () => {
    const [message, setMessage] = useState("Some **content** to preview.");
    return (
      <WritePreview.Root hasContent={!!message.trim()}>
        <WritePreview.Tabs className="mb-2" />
        <WritePreview.WriteSlot>
          <Textarea
            placeholder="Type something…"
            className="min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </WritePreview.WriteSlot>
        <WritePreview.PreviewSlot>
          <div className="border-input min-h-[120px] rounded-md border px-3 py-2">
            <Markdown content={message} />
          </div>
        </WritePreview.PreviewSlot>
      </WritePreview.Root>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially on Write tab — textarea visible
    const textarea = canvas.getByRole("textbox");
    await expect(textarea).toBeVisible();

    // Click Preview tab
    const previewBtn = canvas.getByRole("button", { name: "Preview" });
    await userEvent.click(previewBtn);

    // Textarea should be gone, preview content visible
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(canvas.getByText("content")).toBeVisible();

    // Click Write tab to switch back
    const writeBtn = canvas.getByRole("button", { name: "Write" });
    await userEvent.click(writeBtn);

    // Textarea visible again
    await expect(canvas.getByRole("textbox")).toBeVisible();
  },
};
