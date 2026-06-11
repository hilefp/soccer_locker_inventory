import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, Eraser } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

const TEXT_COLORS: { label: string; value: string }[] = [
  { label: 'Default', value: '#0f172a' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Yellow', value: '#ca8a04' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Pink', value: '#db2777' },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  id,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Sync external value into the editor without disrupting the caret while typing.
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
      setIsEmpty(!value);
    }
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    setIsEmpty(!el.textContent?.trim());
    onChange(html);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    // Emit inline styles (spans) instead of deprecated <font> tags.
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, arg);
    emitChange();
  };

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring',
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          mode="icon"
          className="size-7"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')}
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          mode="icon"
          className="size-7"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('italic')}
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          mode="icon"
          className="size-7"
          title="Underline"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')}
        >
          <Underline className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          mode="icon"
          className="size-7"
          title="Bullet list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('insertUnorderedList')}
        >
          <List className="size-3.5" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Color swatches */}
        <div className="flex items-center gap-1">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              aria-label={`Text color ${color.label}`}
              className="size-5 rounded-full border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color.value }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec('foreColor', color.value)}
            />
          ))}
          {/* Custom color picker */}
          <label
            className="relative size-5 cursor-pointer overflow-hidden rounded-full border border-border"
            title="Custom color"
            style={{
              background:
                'conic-gradient(red, orange, yellow, green, cyan, blue, magenta, red)',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <input
              type="color"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          mode="icon"
          className="size-7"
          title="Clear formatting"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('removeFormat')}
        >
          <Eraser className="size-3.5" />
        </Button>
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          className="min-h-24 w-full px-3 py-2 text-sm outline-none [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5"
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}
