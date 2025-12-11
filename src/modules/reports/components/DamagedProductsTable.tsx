import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DamagedProductReport } from '../types';
import { format } from 'date-fns';

interface DamagedProductsTableProps {
  data: DamagedProductReport[];
}

export function DamagedProductsTable({ data }: DamagedProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Damaged Products Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Qty Lost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(item.date), 'yyyy-MM-dd')}</TableCell>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.warehouse}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell className="text-right">{item.quantityLost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
