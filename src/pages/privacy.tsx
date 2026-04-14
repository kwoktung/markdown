import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              Markdown
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 md:px-8 md:py-24 max-w-4xl">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: October 19, 2025
              </p>
            </div>

            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-6">
                Markdown is an open-source project committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, and
                safeguard your information when you use our service.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Information We Collect
              </h2>
              <p className="text-muted-foreground mb-4">
                When you use Markdown, we may collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>
                  <strong>Account Information:</strong> Email address and
                  authentication details when you sign in
                </li>
                <li>
                  <strong>Document Content:</strong> The markdown content and
                  documents you create and store
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you
                  interact with our service
                </li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Provide and maintain our service</li>
                <li>Store and sync your documents</li>
                <li>Improve and optimize the user experience</li>
                <li>Communicate with you about service updates</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Data Security
              </h2>
              <p className="text-muted-foreground mb-6">
                We implement appropriate security measures to protect your data.
                Your documents are stored securely, and we use industry-standard
                authentication to protect your account.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground mb-6">
                We may use third-party services for authentication and hosting.
                These services have their own privacy policies governing the use
                of your information.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your data</li>
                <li>Export your documents</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Open Source Nature
              </h2>
              <p className="text-muted-foreground mb-6">
                As an open-source project, you can review our code to understand
                exactly how your data is handled. We believe in transparency and
                encourage community contributions to improve privacy and
                security.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:onlyif2009@gmail.com"
                  className="text-primary hover:underline"
                >
                  onlyif2009@gmail.com
                </a>
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 md:px-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Markdown. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/documents"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Documents
            </Link>
            <a
              href="mailto:onlyif2009@gmail.com"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
