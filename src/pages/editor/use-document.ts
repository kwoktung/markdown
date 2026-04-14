import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { MARKDOWN_TEMPLATE } from "@/constants";
import { client } from "@/lib/api-client";
import type { Session } from "@/lib/get-session";

const UNSAVED_DOCUMENT_KEY = "editor-unsaved-document";
const DEFAULT_DOCUMENT_TITLE = "Untitled Document";
const AUTO_SAVE_DELAY = 5000;

export function useDocument(
  documentId: number | undefined,
  session: Session | null,
  autoSaveEnabled: boolean,
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(DEFAULT_DOCUMENT_TITLE);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (documentId) {
      loadDocument(String(documentId));
    } else {
      try {
        const saved = sessionStorage.getItem(UNSAVED_DOCUMENT_KEY);
        let loadedTitle = DEFAULT_DOCUMENT_TITLE;
        let loadedContent = MARKDOWN_TEMPLATE;
        if (saved) {
          const { title: savedTitle, content: savedContent } =
            JSON.parse(saved);
          loadedTitle = savedTitle;
          loadedContent = savedContent;
        }
        setTitle(loadedTitle);
        setContent(loadedContent);
      } catch (error) {
        console.error("Error loading from sessionStorage:", error);
      }
    }
  }, [documentId]);

  const loadDocument = async (id: string) => {
    try {
      isLoadingRef.current = true;
      const res = await client.api.document[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Failed to load document");
      const result = (await res.json()) as {
        document: { title: string; content: string };
      };
      setTitle(result.document.title);
      setContent(result.document.content);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading document:", error);
      alert("Failed to load document");
    } finally {
      isLoadingRef.current = false;
    }
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (session) {
        if (documentId) {
          const putRes = await client.api.document[":id"].$put({
            param: { id: String(documentId) },
            json: { title, content },
          });
          if (!putRes.ok) throw new Error("Failed to update document");
        } else {
          const postRes = await client.api.document.$post({
            json: { title, content },
          });
          if (!postRes.ok) throw new Error("Failed to create document");
          const { id } = (await postRes.json()) as { id: number };

          try {
            sessionStorage.removeItem(UNSAVED_DOCUMENT_KEY);
          } catch (error) {
            console.error("Error clearing sessionStorage:", error);
          }

          navigate({ to: "/editor", search: { id: String(id) } });
        }
      } else {
        sessionStorage.setItem(
          UNSAVED_DOCUMENT_KEY,
          JSON.stringify({ title, content }),
        );
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [documentId, title, content, navigate, queryClient, session]);

  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || isLoadingRef.current) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      handleSaveRef.current();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [autoSaveEnabled, hasUnsavedChanges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSaveRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleInsertText = (text: string) => {
    const newContent = content + "\n\n" + text;
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSetContent = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  return {
    title,
    content,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    handleSave,
    handleTitleChange,
    handleContentChange,
    handleInsertText,
    handleSetContent,
  };
}
