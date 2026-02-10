import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Use Vercel environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const linksContainer = document.getElementById("links-container");
const linkForm = document.getElementById("link-form");
const formMsg = document.getElementById("form-msg");

// Fetch and display links
async function fetchLinks() {
  linksContainer.innerHTML = "Loading links...";
  const { data, error } = await supabase.from("links").select("*").order("category", { ascending: true });
  
  if (error) {
    linksContainer.innerHTML = `Error fetching links: ${error.message}`;
    return;
  }

  if (!data || data.length === 0) {
    linksContainer.innerHTML = "No links yet.";
    return;
  }

  // Group links by category
  const grouped = {};
  data.forEach(link => {
    if (!grouped[link.category]) grouped[link.category] = [];
    grouped[link.category].push(link);
  });

  linksContainer.innerHTML = "";
  for (const category in grouped) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = category;
    header.addEventListener("click", () => {
      const linksEl = catDiv.querySelector(".category-links");
      linksEl.style.display = linksEl.style.display === "block" ? "none" : "block";
    });

    const linksEl = document.createElement("div");
    linksEl.className = "category-links";

    grouped[category].forEach(link => {
      const linkDiv = document.createElement("div");
      linkDiv.className = "link-item";
      linkDiv.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
      linksEl.appendChild(linkDiv);
    });

    catDiv.appendChild(header);
    catDiv.appendChild(linksEl);
    linksContainer.appendChild(catDiv);
  }
}

// Handle adding a new link
linkForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();

  if (!name || !url || !category) {
    formMsg.textContent = "All fields are required!";
    return;
  }

  const { data, error } = await supabase.from("links").insert([{ name, url, category }]);

  if (error) {
    formMsg.textContent = `Error adding link: ${error.message}`;
    return;
  }

  formMsg.textContent = "Link added successfully!";
  linkForm.reset();
  fetchLinks();
});

// Initial load
fetchLinks();
