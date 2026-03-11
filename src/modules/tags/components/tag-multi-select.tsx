'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useTags } from '../hooks/use-tags';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

interface TagMultiSelectProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagMultiSelect({
  selectedTags,
  onTagsChange,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: tags = [], isLoading } = useTags();

  const activeTags = tags.filter((tag) => tag.isActive);

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagName));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
              : 'Select tags...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading tags...' : 'No tags found.'}
              </CommandEmpty>
              <CommandGroup>
                {activeTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleToggleTag(tag.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tagName) => (
            <Badge key={tagName} variant="secondary" className="gap-1">
              {tagName}
              <button
                type="button"
                onClick={() => handleRemoveTag(tagName)}
                className="ml-0.5 rounded-full outline-none hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
