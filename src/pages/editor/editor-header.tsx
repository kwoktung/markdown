import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Eye, Code, Check, FileText } from "lucide-react";

import type { Session } from "@/lib/get-session";
import { ExportPdfButton } from "./export-pdf-button";

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

function SaveStatus({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
}: SaveStatusProps) {
  if (isSaving) {
    return (
      <span className="text-sm text-primary flex items-center gap-2">
        <Save className="h-4 w-4 animate-pulse" />
        <span className="font-medium">Saving...</span>
      </span>
    );
  }
  if (lastSaved && !hasUnsavedChanges) {
    return (
      <span className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
        <Check className="h-4 w-4" />
        <span className="font-medium">Saved</span>
      </span>
    );
  }
  if (hasUnsavedChanges) {
    return (
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="font-medium">Unsaved</span>
      </span>
    );
  }
  return null;
}

interface EditorHeaderProps {
  title: string;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  content: string;
  showPreview: boolean;
  autoSaveEnabled: boolean;
  session: Session | null;
  onTitleChange: (title: string) => void;
  onTogglePreview: () => void;
  onAutoSaveChange: (enabled: boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

export function EditorHeader({
  title,
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  content,
  showPreview,
  autoSaveEnabled,
  session,
  onTitleChange,
  onTogglePreview,
  onAutoSaveChange,
  onSave,
  onBack,
}: EditorHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {session && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
            title="Back to documents"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="border-none shadow-none text-lg font-semibold h-auto py-0 px-0 focus-visible:ring-0 bg-transparent rounded-none"
            placeholder="Untitled Document"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <SaveStatus
            isSaving={isSaving}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePreview}
            title={showPreview ? "Hide preview" : "Show preview"}
            className="shrink-0"
          >
            {showPreview ? (
              <Code className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/50">
            <Switch
              id="auto-save-editor"
              checked={autoSaveEnabled}
              onCheckedChange={onAutoSaveChange}
            />
            <Label
              htmlFor="auto-save-editor"
              className="text-sm font-medium cursor-pointer"
            >
              Auto-save
            </Label>
          </div>

          <Button
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            className="shrink-0"
            title="Save document (Ctrl+S / Cmd+S)"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <ExportPdfButton
            title={title}
            content={content}
            variant="outline"
            size="sm"
            disabled={!content || !title}
            className="shrink-0"
          />
        </div>
      </div>
    </header>
  );
}
