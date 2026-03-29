import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";
const SESSION_COOKIE_NAME = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "uaps_session";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  try {
    const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: sessionCookie
        ? {
            cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
          }
        : undefined,
    });

    if (!logoutResponse.ok) {
      console.error("[logout] API returned non-ok status:", logoutResponse.status);
    }
  } catch (error) {
    console.error("[logout] API fetch error:", error);
    // Continue to clear cookie on web side even if API fails
  }

  try {
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Cookie store delete may not work in all server contexts
  }

  // Revalidate all paths that depend on session state
  revalidatePath("/", "layout");

  const response = NextResponse.redirect(new URL("/", request.url));
  
  // Explicitly clear the session cookie in response headers
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
