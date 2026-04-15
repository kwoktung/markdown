import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

import { Route } from "@/routes/editor";

import { EditorAutoSaveProvider, useAutoSave } from "./auto-save-context";
import { AiChatPanel } from "./ai-chat-panel";
import { AiChatButton } from "./ai-chat-button";
import { MarkdownEditor } from "./markdown-editor";
import { MarkdownPreview } from "./markdown-preview";
import { useDocument } from "./use-document";
import { EditorHeader } from "./editor-header";

export function EditorPage() {
  return (
    <EditorAutoSaveProvider>
      <EditorContent />
    </EditorAutoSaveProvider>
  );
}

function EditorContent() {
  const router = useRouter();
  const { id: documentId } = Route.useSearch();
  const { session } = Route.useLoaderData();
  const { autoSaveEnabled, setAutoSaveEnabled } = useAutoSave();

  const [showPreview, setShowPreview] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const doc = useDocument(documentId, session, autoSaveEnabled);

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeader
        title={doc.title}
        isSaving={doc.isSaving}
        lastSaved={doc.lastSaved}
        hasUnsavedChanges={doc.hasUnsavedChanges}
        content={doc.content}
        showPreview={showPreview}
        autoSaveEnabled={autoSaveEnabled}
        onTitleChange={doc.handleTitleChange}
        onTogglePreview={() => setShowPreview((p) => !p)}
        onAutoSaveChange={setAutoSaveEnabled}
        onSave={doc.handleSave}
        onBack={() => router.history.back()}
        session={session}
      />

      {/* Editor and Preview */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-card">
                <MarkdownEditor
                  value={doc.content}
                  onChange={doc.handleContentChange}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-card">
                <MarkdownPreview markdown={doc.content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full bg-card">
            <MarkdownEditor
              value={doc.content}
              onChange={doc.handleContentChange}
            />
          </div>
        )}
      </div>

      {/* AI Chat — only for authenticated users */}
      {session && (
        <>
          <AiChatButton
            onClick={() => setIsChatOpen((p) => !p)}
            isOpen={isChatOpen}
          />
          <AiChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentContent={doc.content}
            onInsertText={doc.handleInsertText}
            onSetContent={doc.handleSetContent}
          />
        </>
      )}
    </div>
  );
}
