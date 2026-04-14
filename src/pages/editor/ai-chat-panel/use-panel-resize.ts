import { useLocalStorageState } from "#/hooks/use-local-storage-state";

const PANEL_DEFAULT_WIDTH = 450;
const PANEL_MIN_WIDTH = 320;
const PANEL_MAX_WIDTH = 800;
const PANEL_WIDTH_STORAGE_KEY = "editor-panel-width";

export function usePanelResize(defaultWidth = PANEL_DEFAULT_WIDTH) {
  const [width, setWidth] = useLocalStorageState(
    PANEL_WIDTH_STORAGE_KEY,
    defaultWidth,
  );

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (ev: MouseEvent) => {
      const next = window.innerWidth - ev.clientX;
      setWidth(Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, next)));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { width, handleResizeStart };
}
