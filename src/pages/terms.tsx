import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TermsPage() {
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
                Terms of Service
              </h1>
              <p className="text-muted-foreground">
                Last updated: October 19, 2025
              </p>
            </div>

            <section className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground mb-6">
                By accessing and using Markdown, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to these Terms of Service, please do not use our
                service.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Use of Service
              </h2>
              <p className="text-muted-foreground mb-4">
                Markdown is provided as an open-source tool for creating and
                managing documents. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Use the service for lawful purposes only</li>
                <li>Not misuse or abuse the service</li>
                <li>Respect the rights of other users</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                User Accounts
              </h2>
              <p className="text-muted-foreground mb-6">
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">User Content</h2>
              <p className="text-muted-foreground mb-4">
                You retain all rights to the content you create using our
                service. By using Markdown, you grant us the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Store and process your content to provide the service</li>
                <li>Create backups of your content for reliability purposes</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                We will not share, sell, or use your content for any other
                purpose without your explicit consent.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Service Availability
              </h2>
              <p className="text-muted-foreground mb-6">
                We strive to provide reliable service, but we do not guarantee
                that the service will be uninterrupted or error-free. As an
                open-source project, the service is provided &quot;as is&quot;
                without warranties of any kind.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-6">
                The Markdown software is open-source and licensed under the
                terms specified in the project repository. You are free to use,
                modify, and distribute the software according to the license
                terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-6">
                To the maximum extent permitted by law, Markdown shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use or inability to use the
                service.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">Data Backup</h2>
              <p className="text-muted-foreground mb-6">
                While we implement backup procedures, you are responsible for
                maintaining your own backups of your content. We recommend
                regularly exporting your documents.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">Termination</h2>
              <p className="text-muted-foreground mb-6">
                You may terminate your account at any time. We reserve the right
                to terminate or suspend access to the service for violations of
                these terms or for any other reason at our discretion.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Changes to Terms
              </h2>
              <p className="text-muted-foreground mb-6">
                We may modify these Terms of Service at any time. We will notify
                users of any material changes by updating the &quot;Last
                updated&quot; date. Your continued use of the service after such
                changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">Contact</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:onlyif2009@gmail.com"
                  className="text-primary hover:underline"
                >
                  onlyif2009@gmail.com
                </a>
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">
                Open Source Community
              </h2>
              <p className="text-muted-foreground mb-6">
                As an open-source project, we welcome contributions from the
                community. By contributing to the project, you agree that your
                contributions will be licensed under the same license as the
                project.
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
