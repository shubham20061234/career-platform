import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import HomepageClient from "./homepage-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: cards, error: cardsError } = await supabase
    .from("career_cards")
    .select(
      "id, category, title, description, image_url, wikipedia_url, youtube_url, useful_link, resource_url, button_text"
    )
    .eq("published", true)
    .order("id", { ascending: true });

  // IMPORTANT:
  // Use * here because the /blogs page is already working with this query.
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: contactLinks, error: contactError } = await supabase
    .from("contact_links")
    .select("id, platform, label, url, published, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (cardsError) {
    console.error("Career cards error:", cardsError);
  }

  if (blogsError) {
    console.error("Homepage blogs error:", blogsError);
  }

  if (contactError) {
    console.error("Contact links error:", contactError);
  }

  return (
    <HomepageClient
      cards={cards || []}
      blogs={blogs || []}
      contactLinks={contactLinks || []}
    />
  );
}