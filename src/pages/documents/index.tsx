import { useNavigate } from "@tanstack/react-router";
import { useDocumentsList, LIMIT } from "./use-documents-list";
import { useDeleteDocument } from "./use-delete-document";
import { useDuplicateDocument } from "./use-duplicate-document";
import { DocumentsHeader } from "./documents-header";
import { DocumentsTable } from "./documents-table";
import { DocumentsPagination } from "./documents-pagination";
import { DeleteDocumentDialog } from "./delete-document-dialog";

export function DocumentsPage() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    offset,
    currentPage,
    totalPages,
    showPagination,
    goToPreviousPage,
    goToNextPage,
  } = useDocumentsList();
  const { documentToDelete, setDocumentToDelete, deleteMutation } =
    useDeleteDocument();
  const duplicateMutation = useDuplicateDocument();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DocumentsHeader
          onNewDocument={() => navigate({ to: "/editor" })}
          onSignOut={() => navigate({ to: "/sign-out" })}
        />
        <DocumentsTable
          documents={data?.documents ?? []}
          isLoading={isLoading}
          error={error}
          duplicateMutation={duplicateMutation}
          onEdit={(id) =>
            navigate({ to: "/editor", search: { id: String(id) } })
          }
          onDelete={setDocumentToDelete}
          onCreateFirst={() => navigate({ to: "/editor" })}
        />
        {showPagination && (
          <DocumentsPagination
            offset={offset}
            total={data!.total}
            limit={LIMIT}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        )}
        <DeleteDocumentDialog
          open={documentToDelete !== null}
          onOpenChange={(open) => !open && setDocumentToDelete(null)}
          document={documentToDelete}
          onConfirm={() =>
            documentToDelete && deleteMutation.mutate(documentToDelete.id)
          }
          isPending={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
