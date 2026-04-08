import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useListNavigation,
  useInteractions,
  offset,
  flip,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import { GitBranch, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GitRefType } from "@/__generated__/graphql";
import type { RefsQueryRef } from "@/routes/$repo";
import { Button } from "@/components/ui/button";
import * as Listbox from "@/components/ui/listbox";
import { cn } from "@/lib/utils";

interface RefSelectorProps {
  gitRefs: RefsQueryRef[];
  currentRef: string;
  onSelect: (ref: RefsQueryRef) => void;
}

// Branch / tag selector dropdown for the code browser. Shown in two groups
// (branches, tags) with an inline search filter.
export function RefSelector({ gitRefs, currentRef, onSelect }: RefSelectorProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange(nextOpen) {
      setOpen(nextOpen);
      if (!nextOpen) setFilter("");
    },
    placement: "bottom-start",
    middleware: [offset(4), flip()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: true,
    focusItemOnOpen: false,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
  ]);

  const filtered = gitRefs.filter((r) =>
    r.shortName.toLowerCase().includes(filter.toLowerCase()),
  );
  const branches = filtered.filter((r) => r.type === GitRefType.Branch);
  const tags = filtered.filter((r) => r.type === GitRefType.Tag);

  // Build a flat list for indexing (branches first, then tags)
  const flatItems = [...branches, ...tags];

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(flatItems.length > 0 ? 0 : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on filter change
  }, [filter]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && activeIndex != null) {
      e.preventDefault();
      const ref = flatItems[activeIndex];
      if (ref) {
        onSelect(ref);
        setOpen(false);
        setFilter("");
      }
    }
  }

  let itemIndex = 0;

  return (
    <>
      <Button
        ref={refs.setReference}
        variant="outline"
        size="sm"
        className="gap-2 font-mono text-xs"
        {...getReferenceProps()}
      >
        <GitBranch className="size-3.5" />
        {currentRef}
      </Button>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={searchRef}>
            <Listbox.Content
              ref={refs.setFloating}
              style={floatingStyles}
              className="w-64"
              {...getFloatingProps()}
            >
              <div className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-semibold">
                Switch branch / tag
              </div>
              <Listbox.Search
                ref={searchRef}
                placeholder="Filter…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="text-xs"
                aria-activedescendant={
                  activeIndex != null ? `ref-option-${activeIndex}` : undefined
                }
              />
              <Listbox.ScrollArea>
                {branches.length > 0 && (
                  <Listbox.Group>
                    <Listbox.GroupLabel>Branches</Listbox.GroupLabel>
                    {branches.map((ref) => {
                      const i = itemIndex++;
                      return (
                        <RefItem
                          key={ref.name}
                          id={`ref-option-${i}`}
                          ref_={ref}
                          index={i}
                          active={activeIndex === i}
                          selected={ref.shortName === currentRef}
                          elementsRef={elementsRef}
                          getItemProps={getItemProps}
                          onSelect={() => {
                            onSelect(ref);
                            setOpen(false);
                            setFilter("");
                          }}
                        />
                      );
                    })}
                  </Listbox.Group>
                )}
                {tags.length > 0 && (
                  <Listbox.Group>
                    <Listbox.GroupLabel>Tags</Listbox.GroupLabel>
                    {tags.map((ref) => {
                      const i = itemIndex++;
                      return (
                        <RefItem
                          key={ref.name}
                          id={`ref-option-${i}`}
                          ref_={ref}
                          index={i}
                          active={activeIndex === i}
                          selected={ref.shortName === currentRef}
                          elementsRef={elementsRef}
                          getItemProps={getItemProps}
                          onSelect={() => {
                            onSelect(ref);
                            setOpen(false);
                            setFilter("");
                          }}
                        />
                      );
                    })}
                  </Listbox.Group>
                )}
                {filtered.length === 0 && <Listbox.Empty />}
              </Listbox.ScrollArea>
            </Listbox.Content>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

function RefItem({
  id,
  ref_,
  index,
  active,
  selected,
  elementsRef,
  getItemProps,
  onSelect,
}: {
  id: string;
  ref_: RefsQueryRef;
  index: number;
  active: boolean;
  selected: boolean;
  elementsRef: React.MutableRefObject<(HTMLElement | null)[]>;
  getItemProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  onSelect: () => void;
}) {
  return (
    <Listbox.Item
      id={id}
      ref={(el) => {
        elementsRef.current[index] = el;
      }}
      active={active}
      selected={selected}
      className={cn("text-xs", selected && "font-medium")}
      {...getItemProps({ onClick: onSelect })}
    >
      {ref_.type === GitRefType.Branch ? (
        <GitBranch className="text-muted-foreground size-3 shrink-0" />
      ) : (
        <Tag className="text-muted-foreground size-3 shrink-0" />
      )}
      <span className="flex-1 truncate font-mono">{ref_.shortName}</span>
    </Listbox.Item>
  );
}
