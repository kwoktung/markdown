import { useState, useCallback, useRef, useEffect } from "react";
import { client } from "#/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportPdfButtonProps {
  title: string;
  content: string;
  disabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportPdfButton({
  title,
  content,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: ExportPdfButtonProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleExportPdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    setProgress(0);

    try {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return Math.min(prev + Math.random() * 15 + 5, 90);
          if (prev < 99.9) return Math.min(prev + Math.random() * 0.3, 99.9);
          return 99.9;
        });
      }, 200);

      const exportRes = await client.api.pdf.export.$post({
        json: { title, content },
      });
      if (!exportRes.ok) throw new Error("Failed to initiate PDF export");
      const { id } = (await exportRes.json()) as { id: string };

      const pdfRes = await client.api.pdf[":id"].$get({ param: { id } });
      if (!pdfRes.ok) throw new Error("Failed to fetch generated PDF");

      const blob = await pdfRes.blob();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title.replace(/\s+/gi, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsGeneratingPdf(false);
      setProgress(0);
    }
  }, [title, content]);

  return (
    <Popover open={isGeneratingPdf}>
      <PopoverTrigger asChild>
        <Button
          onClick={handleExportPdf}
          disabled={disabled || isGeneratingPdf}
          variant={variant}
          size={size}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPdf ? "Generating..." : "Export PDF"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6" align="center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Generating PDF</h3>
              <p className="text-xs text-muted-foreground">
                Please wait while we prepare your document...
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
