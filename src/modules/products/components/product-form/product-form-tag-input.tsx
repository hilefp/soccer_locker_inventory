import { useState } from 'react';
import { CircleX } from 'lucide-react';
import { Badge, BadgeButton } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface ProductFormTagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function ProductFormTagInput({ tags, setTags }: ProductFormTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-2.5">
        <Label className="text-xs leading-3">Tags</Label>
        <Input
          placeholder="Add tags (press Enter or comma)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            appearance="light"
            className="flex items-center gap-1"
          >
            {tag}
            <BadgeButton onClick={() => removeTag(tag)}>
              <CircleX className="size-3.5 text-muted-foreground" />
            </BadgeButton>
          </Badge>
        ))}
      </div>
    </div>
  );
}
