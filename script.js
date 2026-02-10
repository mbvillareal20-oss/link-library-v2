const linkForm = document.getElementById("linkForm");
const linksContainer = document.getElementById("linksContainer");

linkForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();

  try {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, category })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert("✅ Link added!");
    linkForm.reset();
    fetchLinks();
  } catch (err) {
    console.error("Error adding link:", err.message);
    alert("❌ Error adding link: " + err.message);
  }
});

async function fetchLinks() {
  try {
    const res = await fetch("/api/links");
    const links = await res.json();

    if (!Array.isArray(links)) throw new Error("Invalid response");

    // Group by category
    const grouped = links.reduce((acc, link) => {
      if (!acc[link.category]) acc[link.category] = [];
      acc[link.category].push(link);
      return acc;
    }, {});

    // Render
    linksContainer.innerHTML = "";
    for (const category in grouped) {
      const catDiv = document.createElement("div");
      catDiv.className = "category";

      const catHeader = document.createElement("h2");
      catHeader.textContent = category;
      catHeader.addEventListener("click", () => {
        listDiv.style.display = listDiv.style.display === "block" ? "none" : "block";
      });

      const listDiv = document.createElement("div");
      listDiv.className = "links-list";
      grouped[category].forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.textContent = link.name;
        listDiv.appendChild(a);
      });

      catDiv.appendChild(catHeader);
      catDiv.appendChild(listDiv);
      linksContainer.appendChild(catDiv);
    }

  } catch (err) {
    console.error("Error fetching links:", err.message);
    linksContainer.innerHTML = "<p>No links yet.</p>";
  }
}

// Initial load
fetchLinks();
