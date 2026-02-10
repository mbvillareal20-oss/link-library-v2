import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ⚠️ These MUST come from Vercel env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("link-form");
const linksDiv = document.getElementById("links");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const url = urlInput.value;
  const category = categoryInput.value;

  await supabase.from("links").insert([{ name, url, category }]);

  form.reset();
  loadLinks();
});

async function loadLinks() {
  linksDiv.innerHTML = "";

  const { data } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  const grouped = {};
  data.forEach(l => {
    grouped[l.category] = grouped[l.category] || [];
    grouped[l.category].push(l);
  });

  Object.keys(grouped).forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const title = document.createElement("h2");
    title.textContent = cat;

    const list = document.createElement("div");

    title.onclick = () => {
      list.style.display = list.style.display === "none" ? "block" : "none";
    };

    grouped[cat].forEach(l => {
      const item = document.createElement("div");
      item.className = "link";
      item.innerHTML = `<a href="${l.url}" target="_blank">${l.name}</a>`;
      list.appendChild(item);
    });

    catDiv.append(title, list);
    linksDiv.appendChild(catDiv);
  });
}

loadLinks();
