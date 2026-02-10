import { createClient } from '@supabase/supabase-js';

// === Supabase Setup ===
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'YOUR_SUPABASE_SECRET';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const form = document.getElementById('add-link-form');
const nameInput = document.getElementById('name');
const urlInput = document.getElementById('url');
const categoryInput = document.getElementById('category');
const messageDiv = document.getElementById('message');
const linksContainer = document.getElementById('links-container');

// === Fetch Links from Supabase ===
async function fetchLinks() {
  linksContainer.innerHTML = '';
  const { data, error } = await supabase.from('links').select('*');

  if (error) {
    linksContainer.innerHTML = `<p style="color:red;">Error fetching links: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    linksContainer.innerHTML = '<p>No links yet.</p>';
    return;
  }

  // Group links by category
  const categories = {};
  data.forEach(link => {
    if (!categories[link.category]) categories[link.category] = [];
    categories[link.category].push(link);
  });

  // Render categories
  for (const [cat, links] of Object.entries(categories)) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';

    const button = document.createElement('button');
    button.textContent = `${cat} (${links.length})`;
    button.onclick = () => {
      list.style.display = list.style.display === 'block' ? 'none' : 'block';
    };

    const list = document.createElement('div');
    list.className = 'links-list';

    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.textContent = link.name;
      list.appendChild(a);
    });

    categoryDiv.appendChild(button);
    categoryDiv.appendChild(list);
    linksContainer.appendChild(categoryDiv);
  }
}

// === Add Link ===
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  const category = categoryInput.value.trim();

  if (!name || !url || !category) return;

  const { data, error } = await supabase.from('links').insert([{ name, url, category }]);

  if (error) {
    messageDiv.textContent = `Error adding link: ${error.message}`;
    messageDiv.style.color = 'red';
  } else {
    messageDiv.textContent = '✅ Link added successfully!';
    messageDiv.style.color = 'green';
    nameInput.value = '';
    urlInput.value = '';
    categoryInput.value = '';
    fetchLinks();
  }
});

// Initial fetch
fetchLinks();
