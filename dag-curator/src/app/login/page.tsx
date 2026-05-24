"use client";

import { signIn } from "next-auth/react";
import { GitPullRequest, Github } from "lucide-react";
import { SessionProvider } from "@/components/layout/SessionProvider";

function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GitPullRequest className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold">DAG Curator</span>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          Curate epidemiological DAGs for DAGpedia.
          Sign in with GitHub to continue.
        </p>

        <button
          onClick={() => signIn("github")}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Access restricted to dagpedia collaborators
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  );
}
