import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Settings,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsCardProps {
  variantId: string;
  sku: string;
}

export function QuickActionsCard({ variantId, sku }: QuickActionsCardProps) {
  const handleAdjustStock = () => {
    toast.info('Adjust stock feature coming soon');
    // TODO: Open adjust stock modal
  };

  const handleRegisterEntry = () => {
    toast.info('Register entry feature coming soon');
    // TODO: Open register entry modal
  };

  const handleRegisterExit = () => {
    toast.info('Register exit feature coming soon');
    // TODO: Open register exit modal
  };

  const handleTransfer = () => {
    toast.info('Transfer stock feature coming soon');
    // TODO: Open transfer stock modal
  };

  const handleViewMovements = () => {
    toast.info('Full movement history coming soon');
    // TODO: Navigate to movements page or open modal
  };

  const handleGenerateReport = () => {
    toast.info('Generate report feature coming soon');
    // TODO: Open report generation modal
  };

  const handleStockCount = () => {
    toast.info('Physical count feature coming soon');
    // TODO: Open stock count modal
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdjustStock}
            className="w-full justify-start text-base h-auto py-3"
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Adjust Stock</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegisterEntry}
            className="w-full justify-start text-base h-auto py-3"
          >
            <TrendingUp className="h-5 w-5 mr-3 text-green-600" />
            <span>Register Entry</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegisterExit}
            className="w-full justify-start text-base h-auto py-3"
          >
            <TrendingDown className="h-5 w-5 mr-3 text-red-600" />
            <span>Register Exit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTransfer}
            className="w-full justify-start text-base h-auto py-3"
          >
            <ArrowRightLeft className="h-5 w-5 mr-3 text-blue-600" />
            <span>Transfer Stock</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStockCount}
            className="w-full justify-start text-base h-auto py-3"
          >
            <RefreshCw className="h-5 w-5 mr-3" />
            <span>Physical Count</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewMovements}
            className="w-full justify-start text-base h-auto py-3"
          >
            <History className="h-5 w-5 mr-3" />
            <span>View All Movements</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="w-full justify-start text-base h-auto py-3"
          >
            <FileText className="h-5 w-5 mr-3" />
            <span>Generate Report</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-accent/50 rounded-md">
          Quick access to common operations
        </div>
      </CardContent>
    </Card>
  );
}
