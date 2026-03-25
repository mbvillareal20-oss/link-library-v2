const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwvlS2P_2Z-7hSBuXZ-HibW5AdxM5vaw4yU4sPJbqhIT_GSWVQoVDzgg2Tzf3PhElfO6A/exec";

let linksData = [];

// Fetch all links
async function fetchLinks() {
  const res = await fetch(WEB_APP_URL);
  const data = await res.json();
  linksData = data;
  renderLinks(linksData);
}

// Add a new link
async function addLink(name, url, category) {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({ action: "addLink", data: { name, url, category } }),
    headers: { "Content-Type": "application/json" },
  });
  const result = await res.json();
  console.log("Added link:", result);
  return result.id;
}

// Update order after drag-and-drop
async function updateOrder(newOrderArray) {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({ action: "updateOrder", data: newOrderArray }),
    headers: { "Content-Type": "application/json" },
  });
  const result = await res.json();
  console.log("Order updated:", result);
}

// Render links
function renderLinks(links) {
  const container = document.getElementById("linkContainer");
  container.innerHTML = "";

  // Group by category
  const categories = [...new Set(links.map(l => l.category))];

  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.classList.add("category-group");
    catDiv.innerHTML = `<h2>${cat}</h2>`;

    const ul = document.createElement("ul");
    ul.classList.add("link-list");

    links
      .filter(l => l.category === cat)
      .sort((a, b) => a.order - b.order)
      .forEach(link => {
        const li = document.createElement("li");
        li.classList.add("link-item");
        li.dataset.id = link.id;
        li.innerHTML = `<strong>${link.name}</strong> <a href="${link.url}" target="_blank">${link.url}</a>`;
        ul.appendChild(li);
      });

    catDiv.appendChild(ul);
    container.appendChild(catDiv);

    // Make this list sortable
    new Sortable(ul, {
      animation: 150,
      onEnd: () => {
        const newOrder = [...ul.children].map((li, idx) => ({
          id: parseInt(li.dataset.id),
          order: idx + 1,
        }));
        updateOrder(newOrder);
      },
    });
  });
}

// Add button click
document.getElementById("addBtn")?.addEventListener("click", async () => {
  const name = document.getElementById("linkName").value;
  const url = document.getElementById("linkURL").value;
  const category = document.getElementById("linkCategory").value;

  if (!name || !url || !category) return alert("Please fill all fields");

  await addLink(name, url, category);
  document.getElementById("linkName").value = "";
  document.getElementById("linkURL").value = "";
  document.getElementById("linkCategory").value = "";
  fetchLinks();
});

// Search filter
document.getElementById("searchBox")?.addEventListener("input", e => {
  const search = e.target.value.toLowerCase();
  const filtered = linksData.filter(l =>
    l.name.toLowerCase().includes(search) ||
    l.url.toLowerCase().includes(search) ||
    l.category.toLowerCase().includes(search)
  );
  renderLinks(filtered);
});

// On page load
window.addEventListener("DOMContentLoaded", fetchLinks);