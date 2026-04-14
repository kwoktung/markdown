import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, FileText, Loader2, Copy } from "lucide-react";
import type { Document } from "./types";

interface DocumentsTableProps {
  documents: Document[];
  isLoading: boolean;
  error: Error | null;
  duplicateMutation: {
    mutate: (id: number) => void;
    isPending: boolean;
    variables: number | undefined;
  };
  onEdit: (id: number) => void;
  onDelete: (document: Document) => void;
  onCreateFirst: () => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentsTable({
  documents,
  isLoading,
  error,
  duplicateMutation,
  onEdit,
  onDelete,
  onCreateFirst,
}: DocumentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%] py-4">Title</TableHead>
              <TableHead className="w-[20%] py-4">Created</TableHead>
              <TableHead className="w-[20%] py-4">Updated</TableHead>
              <TableHead className="w-[10%] text-right py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 shrink-0" />
                    <Skeleton className="h-5 w-[60%]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Skeleton className="size-9" />
                    <Skeleton className="size-9" />
                    <Skeleton className="size-9" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-center">
            Failed to load documents. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by creating your first resume document
          </p>
          <Button onClick={onCreateFirst}>
            <Plus className="size-4" />
            Create Your First Document
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%] py-4">Title</TableHead>
            <TableHead className="w-[20%] py-4">Created</TableHead>
            <TableHead className="w-[20%] py-4">Updated</TableHead>
            <TableHead className="w-[10%] text-right py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className="cursor-pointer"
              onClick={() => onEdit(document.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <span className="line-clamp-1">{document.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(document.createdAt)}
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(document.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(document.id);
                    }}
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateMutation.mutate(document.id);
                    }}
                    disabled={duplicateMutation.isPending}
                    title="Duplicate"
                  >
                    {duplicateMutation.isPending &&
                    duplicateMutation.variables === document.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(document);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
