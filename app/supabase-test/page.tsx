import { supabase } from "@/src/lib/supabase";

export default async function SupabaseTest() {
  const { data, error } = await supabase
    .from("test_connection")
    .select("*");

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        Supabase Test
      </h1>

      <p className="mt-4">
        {error ? `Error: ${error.message}` : "Supabase connected successfully!"}
      </p>

      <pre className="mt-4">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}