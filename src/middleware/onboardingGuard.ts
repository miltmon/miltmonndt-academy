// simple guard util (not framework specific)
import { supabase } from "@/integrations/supabase/client";

export async function ensureOnboarded(redirectIfNot = true): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;
  const { data, error: queryError } = await supabase.from("users").select("onboarding_status").eq("id", user.id).single();
  if (queryError) throw queryError;
  return data?.onboarding_status === "completed";
}
