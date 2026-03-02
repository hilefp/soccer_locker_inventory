import { Button } from '@/shared/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ExportExcelButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  label?: string;
}

export function ExportExcelButton({
  onClick,
  loading,
  disabled = false,
  label = 'Exportar Excel',
}: ExportExcelButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-lg border-2 border-green-600/30 text-green-700 hover:bg-green-50 hover:border-green-600/50 dark:text-green-400 dark:hover:bg-green-950/30 transition-all duration-200"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Exportando...' : label}
    </Button>
  );
}
