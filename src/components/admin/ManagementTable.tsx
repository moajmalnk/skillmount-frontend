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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description || `Manage your ${title.toLowerCase()}`}</CardDescription>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {filters && <div className="mb-4">{filters}</div>}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, idx) => (
                  <TableHead key={idx}>{col}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};