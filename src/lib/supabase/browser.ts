"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

export const supabaseBrowser = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
