// Floating popover built on @base-ui/react. Used in the header (theme picker)
// and issue-filters (sort/label/author dropdowns).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings } from "lucide-react";

import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const meta = {
  component: Popover,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Settings className="size-4" />
            Settings
          </Button>
        }
      />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Preferences</PopoverTitle>
          <PopoverDescription>Adjust your display settings.</PopoverDescription>
        </PopoverHeader>
        <p className="text-muted-foreground text-sm">Popover body content goes here.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const Closed: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Settings className="size-4" />
            Settings
          </Button>
        }
      />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Preferences</PopoverTitle>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
