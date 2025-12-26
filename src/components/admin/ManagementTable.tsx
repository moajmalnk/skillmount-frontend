import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface ManagementTableProps {
  title: string;
  description?: string;
  columns: string[];
  onAddNew?: () => void;
  filters?: ReactNode; // New prop for filter bar
  children?: ReactNode;
}

export const ManagementTable = ({ title, description, columns, onAddNew, filters, children }: ManagementTableProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 sm:py-6">
        <div className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description || `Manage your ${title.toLowerCase()}`}</CardDescription>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        {filters && <div className="mb-4">{filters}</div>}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};