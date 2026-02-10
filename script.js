const form = document.getElementById('link-form');
const message = document.getElementById('form-message');
const container = document.getElementById('links-container');

// Fetch links from serverless function
async function fetchLinks() {
  try {
    const res = await fetch('/api/links');
    const data = await res.json();
    if (!data || data.error) throw new Error(data.error || "Error fetching links");

    const grouped = data.reduce((acc, link) => {
      (acc[link.category] = acc[link.category] || []).push(link);
      return acc;
    }, {});

    renderLinks(grouped);
  } catch (err) {
    container.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// Render collapsible categories
function renderLinks(grouped) {
  container.innerHTML = '';
  for (const category in grouped) {
    const div = document.createElement('div');
    div.className = 'category';

    const title = document.createElement('h3');
    title.textContent = category;
    title.addEventListener('click', () => {
      div.classList.toggle('collapsed');
    });

    const list = document.createElement('ul');
    grouped[category].forEach(link => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
      list.appendChild(li);
    });

    div.appendChild(title);
    div.appendChild(list);
    container.appendChild(div);
  }
}

// Add new link
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const url = document.getElementById('url').value.trim();
  const category = document.getElementById('category').value.trim();

  if (!name || !url || !category) return;

  try {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, category })
    });
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    message.textContent = "✅ Link added!";
    form.reset();
    fetchLinks();
  } catch (err) {
    message.textContent = `❌ Error adding link: ${err.message}`;
  }
});

fetchLinks();
