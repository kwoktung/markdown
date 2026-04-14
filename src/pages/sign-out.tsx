import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Check } from "lucide-react";
import { signOut } from "@/lib/auth";

export function SignOutPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"logging-out" | "success">(
    "logging-out",
  );

  useEffect(() => {
    const performLogout = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 600));
      await signOut();
      navigate({ to: "/" });
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={`
                rounded-full p-4 transition-all duration-500
                ${status === "logging-out" ? "bg-muted/50" : "bg-emerald-500/10"}
              `}
            >
              {status === "logging-out" ? (
                <LogOut className="size-8 text-muted-foreground/60 animate-pulse" />
              ) : (
                <Check className="size-8 text-emerald-600 dark:text-emerald-500 animate-in zoom-in duration-300" />
              )}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1
              className={`
                text-2xl font-semibold transition-colors duration-500
                ${
                  status === "logging-out"
                    ? "text-foreground"
                    : "text-emerald-600 dark:text-emerald-500"
                }
              `}
            >
              {status === "logging-out" ? "Signing out..." : "Signed out"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {status === "logging-out"
                ? "Please wait a moment"
                : "Redirecting you now"}
            </p>
          </div>

          {/* Progress indicator */}
          {status === "logging-out" && (
            <div className="flex justify-center">
              <div className="flex gap-1">
                <div className="size-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="size-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="size-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
