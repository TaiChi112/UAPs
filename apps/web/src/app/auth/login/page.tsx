import { buildGithubLoginUrl } from "@/lib/api";
import { getSessionServer } from "@/lib/server-api";
import { redirect } from "next/navigation";

export default async function AuthLoginPage() {
  const session = await getSessionServer();

  // If already signed in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // If not signed in, redirect to GitHub OAuth
  redirect(buildGithubLoginUrl());
}
