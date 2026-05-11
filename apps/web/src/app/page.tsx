import { redirect } from "next/navigation";

export default function Page() {
  // Temporary server-side redirect so the prototype v5 page becomes the site root
  redirect("/prototype/v5");
}
