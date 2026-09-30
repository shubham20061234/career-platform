import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("ADMIN AUTH CHECK:", {
    hasUser: !!user,
    userId: user?.id,
    userError: userError?.message,
  });

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("ADMIN PROFILE CHECK:", {
    profile,
    profileError: profileError?.message,
  });

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}