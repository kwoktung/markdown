import React, { createContext, useContext } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

interface AutoSaveContextType {
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(
  undefined,
);

type EditorAutoSaveProviderProps = {
  children: React.ReactNode;
  persistKey?: string;
};

export function EditorAutoSaveProvider({
  children,
  persistKey = "editor-auto-save-enabled",
}: EditorAutoSaveProviderProps) {
  const [autoSaveEnabled, setAutoSaveEnabled] = useLocalStorageState(
    persistKey,
    true,
  );

  return (
    <AutoSaveContext.Provider value={{ autoSaveEnabled, setAutoSaveEnabled }}>
      {children}
    </AutoSaveContext.Provider>
  );
}

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error("useAutoSave must be used within an AutoSaveProvider");
  }
  return context;
}
