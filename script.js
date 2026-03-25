const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchLinks");

// Replace with your deployed Apps Script URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwvlS2P_2Z-7hSBuXZ-HibW5AdxM5vaw4yU4sPJbqhIT_GSWVQoVDzgg2Tzf3PhElfO6A/exec";

let allLinks = [];

// Fetch all links from Google Sheets
async function fetchLinks() {
    try {
        const res = await fetch(WEB_APP_URL);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid data");

        allLinks = data.map(l => ({
            id: parseInt(l.id),
            name: l.name,
            url: l.url,
            category: l.category,
            order: parseInt(l.order)
        }));

        renderLinksByCategory(allLinks);
    } catch (err) {
        linkList.innerHTML = `<p class="error">Error fetching links</p>`;
        console.error(err);
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
            <ul></ul>
        `;
        const ul = div.querySelector("ul");

        categories[cat]
            .sort((a, b) => a.order - b.order)
            .forEach(l => {
                const li = document.createElement("li");
                li.dataset.id = l.id;
                li.innerHTML = `<a href="${l.url}" target="_blank">${l.name}</a>`;
                ul.appendChild(li);
            });

        linkList.appendChild(div);

        // Toggle category collapse
        div.querySelector("h3").addEventListener("click", () => div.classList.toggle("collapsed"));

        // Enable drag-and-drop per category using SortableJS
        if (typeof Sortable !== "undefined") {
            new Sortable(ul, {
                animation: 150,
                onEnd: () => {
                    const newOrder = [...ul.children].map((li, idx) => ({
                        id: parseInt(li.dataset.id),
                        order: idx + 1
                    }));
                    updateOrder(newOrder);
                }
            });
        }
    }
}

// Add a new link
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

        if (res.ok) {
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
    } catch (err) {
        formMessage.textContent = "Error adding link.";
        formMessage.style.color = "red";
        console.error(err);
    }
});

// Update order in Google Sheets
async function updateOrder(orderArray) {
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "updateOrder", data: orderArray })
        });
    } catch (err) {
        console.error("Failed to update order", err);
    }
}

// Search/filter links
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allLinks.filter(l =>
        l.name.toLowerCase().includes(query) ||
        (l.category && l.category.toLowerCase().includes(query)) ||
        l.url.toLowerCase().includes(query)
    );
    renderLinksByCategory(filtered);
});

// Load links on page load
window.addEventListener("DOMContentLoaded", fetchLinks);