import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const linksDiv = document.getElementById("links");
const form = document.getElementById("add-form");

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
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("category");

  if (error) {
    linksDiv.innerHTML = "Error loading links";
    console.error(error);
    return;
  }

  linksDiv.innerHTML = "";

  const grouped = {};
  data.forEach(l => {
    grouped[l.category] = grouped[l.category] || [];
    grouped[l.category].push(l);
  });

  for (const cat in grouped) {
    const section = document.createElement("section");
    section.innerHTML = `<h2>${cat}</h2>`;

    grouped[cat].forEach(l => {
      const div = document.createElement("div");
      div.innerHTML = `<a href="${l.url}" target="_blank">${l.name}</a>`;
      section.appendChild(div);
    });

    linksDiv.appendChild(section);
  }
}

loadLinks();
