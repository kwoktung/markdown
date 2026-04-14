import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus, LogOut } from "lucide-react";

interface DocumentsHeaderProps {
  onNewDocument: () => void;
  onSignOut: () => void;
}

export function DocumentsHeader({
  onNewDocument,
  onSignOut,
}: DocumentsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            My Documents
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your resume documents
          </p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={onSignOut}
          >
            <LogOut className="size-5" />
          </Button>
          <Button size="lg" className="gap-2" onClick={onNewDocument}>
            <Plus className="size-5" />
            New Document
          </Button>
        </div>
      </div>
    </div>
  );
}
