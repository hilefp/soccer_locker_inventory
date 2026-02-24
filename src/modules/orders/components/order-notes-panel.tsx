import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { formatDate } from '@/shared/lib/helpers';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  useOrderNotes,
  useCreateOrderNote,
  useDeleteOrderNote,
} from '@/modules/orders/hooks/use-orders';
import { OrderNoteType } from '@/modules/orders/types';

interface OrderNotesPanelProps {
  orderId: string;
}

function authorLabel(
  createdByUserId: string | null,
  currentUserId: string | undefined,
  type: OrderNoteType
) {
  if (type === 'SYSTEM') return 'System';
  if (!createdByUserId) return 'Staff';
  if (createdByUserId === currentUserId) return 'You';
  return `User …${createdByUserId.slice(-8)}`;
}

export function OrderNotesPanel({ orderId }: OrderNotesPanelProps) {
  const [noteContent, setNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const { user } = useAuthStore();
  const { data: notes, isLoading } = useOrderNotes(orderId);
  const createNote = useCreateOrderNote();
  const deleteNote = useDeleteOrderNote();

  const handleAddNote = () => {
    if (!noteContent.trim() || createNote.isPending) return;
    createNote.mutate(
      {
        orderId,
        data: { content: noteContent.trim(), isPrivate, createdByUserId: user?.id },
      },
      { onSuccess: () => setNoteContent('') }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote.mutate({ orderId, noteId });
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <h2 className="text-base font-semibold">Order notes</h2>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading notes…</div>
          ) : notes && notes.length > 0 ? (
            <div className="divide-y">
              {notes.map((note) => (
                <div key={note.id} className="p-4 space-y-2">
                  <div className="relative rounded-md bg-muted/60 px-3 py-2.5 text-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    {/* speech-bubble tail */}
                    <span className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-muted/60" />
                  </div>
                  <div className="flex items-center justify-between pl-1 pt-1 text-xs text-muted-foreground">
                    <span>
                      {formatDate(new Date(note.createdAt))}
                      {' · '}
                      <span className="font-medium text-foreground/70">
                        {authorLabel(note.createdByUserId, user?.id, note.type)}
                      </span>
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleteNote.isPending}
                      className="text-destructive hover:underline disabled:opacity-50"
                    >
                      Delete note
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No notes yet.</div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            Add note
            <span
              className="flex items-center justify-center rounded-full border text-muted-foreground cursor-default text-xs h-4 w-4"
              title="Notes are visible only to staff unless marked as customer note"
            >
              ?
            </span>
          </p>
          <Textarea
            placeholder="Add a note about this order…"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={isPrivate ? 'private' : 'customer'}
              onValueChange={(v) => setIsPrivate(v === 'private')}
            >
              <SelectTrigger className="flex-1 text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private note</SelectItem>
                <SelectItem value="customer">Customer note</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!noteContent.trim() || createNote.isPending}
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
