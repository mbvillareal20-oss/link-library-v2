import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, url, category } = req.body;

    if (!name || !url || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const { data, error } = await supabase
      .from("links")
      .insert([{ name, url, category }]);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: "Link added successfully!", data });
  } else if (req.method === "GET") {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
