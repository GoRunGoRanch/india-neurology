import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";

/** Per-request Supabase client acting as the signed-in reviewer (RLS applies). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => store.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        try {
          store.set({ name, value, ...options });
        } catch {
          // Server Components can't set cookies; middleware refreshes the session instead.
        }
      },
      remove: (name: string, options: CookieOptions) => {
        try {
          store.set({ name, value: "", ...options });
        } catch {
          // As above.
        }
      },
    },
  });
}

export interface Reviewer {
  id: string;
  email: string;
  name: string;
  isReviewer: boolean;
}

/** The signed-in user and whether they hold the verifier/admin role, or null if signed out. */
export async function currentReviewer(): Promise<Reviewer | null> {
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    sb.from("user_roles").select("role_code").eq("user_id", data.user.id),
    sb.from("users").select("display_name").eq("id", data.user.id).maybeSingle(),
  ]);
  const codes = (roles ?? []).map((r) => r.role_code as string);
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (profile?.display_name as string | undefined) || data.user.email || "Reviewer",
    isReviewer: codes.includes("verifier") || codes.includes("admin"),
  };
}
