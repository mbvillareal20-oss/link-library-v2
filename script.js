const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx_DUeJBdMYPT7L24V6LRpExuF0zGv7yUfhmbI6LapvH0sgBVG6opopuUsgJ4iTLAdqBA/exec";

const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchLinks");

let allLinks = [];

// Fetch links from Google Sheets
async function fetchLinks() {
    try {
        const res = await fetch(WEB_APP_URL);
        const data = await res.json();

        if (!Array.isArray(data)) {
            linkList.innerHTML = `<p class="error">Error: Invalid data received</p>`;
            return;
        }

        allLinks = data.sort((a,b) => (a.order || 0) - (b.order || 0));
        renderLinksByCategory(allLinks);
        initDragAndDrop();
    } catch (error) {
        linkList.innerHTML = `<p class="error">Error fetching links</p>`;
        console.error(error);
    }
}

// Render links grouped by category
function renderLinksByCategory(links) {
    const categories = {};
    links.forEach(link => {
        const cat = link.category || "Uncategorized";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(link);
    });

    linkList.innerHTML = "";

    for (const cat in categories) {
        const div = document.createElement("div");
        div.className = "category";
        div.innerHTML = `
            <h3>${cat}</h3>
            <ul id="list-${cat.replace(/\s/g,'-')}">
                ${categories[cat].map(l => `<li data-id="${l.id}"><a href="${l.url}" target="_blank">${l.name}</a></li>`).join('')}
            </ul>
        `;
        linkList.appendChild(div);
    }

    // Toggle categories
    document.querySelectorAll(".category h3").forEach(h3 => {
        h3.addEventListener("click", () => h3.parentElement.classList.toggle("collapsed"));
    });
}

// Initialize drag-and-drop per category
function initDragAndDrop() {
    document.querySelectorAll(".category ul").forEach(ul => {
        new Sortable(ul, {
            animation: 150,
            onEnd: async () => {
                const updates = [];
                ul.querySelectorAll("li").forEach((li, index) => {
                    updates.push({ id: li.dataset.id, order: index + 1 });
                });
                await updateOrder(updates);
                fetchLinks(); // refresh
            }
        });
    });
}

// Update order in Google Sheets
async function updateOrder(updates) {
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "updateOrder", data: updates })
        });
    } catch (err) {
        console.error("Failed to update order", err);
    }
}

// Filter links by search input
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredLinks = allLinks.filter(
        link => link.name.toLowerCase().includes(query) ||
                (link.category && link.category.toLowerCase().includes(query)) ||
                link.url.toLowerCase().includes(query)
    );
    renderLinksByCategory(filteredLinks);
    initDragAndDrop();
});

// Add new link
submitButton.addEventListener("click", async () => {
    const name = document.getElementById("newName").value.trim();
    const url = document.getElementById("newURL").value.trim();
    const category = document.getElementById("newCategory").value.trim();

    if (!name || !url) {
        formMessage.textContent = "Name and URL are required";
        formMessage.style.color = "red";
        return;
    }

    try {
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "addLink", data: { name, url, category } })
        });
        const result = await res.json();

        if (res.ok && result.status === "success") {
            formMessage.textContent = "Link added successfully!";
            formMessage.style.color = "green";
            document.getElementById("newName").value = "";
            document.getElementById("newURL").value = "";
            document.getElementById("newCategory").value = "";
            fetchLinks();
        } else {
            formMessage.textContent = `Error: ${result.error || "Failed to add link"}`;
            formMessage.style.color = "red";
        }
    } catch (error) {
        formMessage.textContent = "Error adding link.";
        formMessage.style.color = "red";
        console.error(error);
    }
});

// Fetch links on page load
fetchLinks();