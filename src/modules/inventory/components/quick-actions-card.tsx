import { useState } from 'react';
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
import { IncrementStockDrawer } from './increment-stock-drawer';
import { AdjustStockDrawer } from './adjust-stock-drawer';
import { PhysicalCountDrawer } from './physical-count-drawer';
import { RegisterExitDrawer } from './register-exit-drawer';

interface QuickActionsCardProps {
  variantId: string;
  sku: string;
  currentStock?: number;
}

export function QuickActionsCard({ variantId, sku, currentStock }: QuickActionsCardProps) {
  const [isIncrementDrawerOpen, setIsIncrementDrawerOpen] = useState(false);
  const [isAdjustDrawerOpen, setIsAdjustDrawerOpen] = useState(false);
  const [isPhysicalCountDrawerOpen, setIsPhysicalCountDrawerOpen] = useState(false);
  const [isRegisterExitDrawerOpen, setIsRegisterExitDrawerOpen] = useState(false);

  const handleAdjustStock = () => {
    setIsAdjustDrawerOpen(true);
  };

  const handleRegisterEntry = () => {
    setIsIncrementDrawerOpen(true);
  };

  const handleRegisterExit = () => {
    setIsRegisterExitDrawerOpen(true);
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
    setIsPhysicalCountDrawerOpen(true);
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
            onClick={handleStockCount}
            className="w-full justify-start text-base h-auto py-3"
          >
            <RefreshCw className="h-5 w-5 mr-3" />
            <span>Physical Count</span>
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

      <IncrementStockDrawer
        open={isIncrementDrawerOpen}
        onOpenChange={setIsIncrementDrawerOpen}
        variantId={variantId}
        sku={sku}
        currentStock={currentStock}
      />

      <AdjustStockDrawer
        open={isAdjustDrawerOpen}
        onOpenChange={setIsAdjustDrawerOpen}
        variantId={variantId}
        sku={sku}
        currentStock={currentStock}
      />

      <PhysicalCountDrawer
        open={isPhysicalCountDrawerOpen}
        onOpenChange={setIsPhysicalCountDrawerOpen}
        variantId={variantId}
        sku={sku}
        currentStock={currentStock}
      />

      <RegisterExitDrawer
        open={isRegisterExitDrawerOpen}
        onOpenChange={setIsRegisterExitDrawerOpen}
        variantId={variantId}
        sku={sku}
        currentStock={currentStock}
      />
    </Card>
  );
}
