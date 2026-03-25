const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchLinks");

// Replace this with your Google Apps Script URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyAVzfNUMS0Z23eIJqLJaK2x4o41Pd9XP9tlMBATi0LBdXPvrK2WlCet1K0-CwMoO-wtg/exec";

let allLinks = [];

// Fetch links from Google Sheets
async function fetchLinks() {
    try {
        const res = await fetch(SHEET_URL);
        const data = await res.json();

        if (!Array.isArray(data)) {
            linkList.innerHTML = `<p class="error">Error: Invalid data received</p>`;
            return;
        }

        allLinks = data;
        renderLinksByCategory(allLinks);
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
            <ul id="list-${cat}">
                ${categories[cat].map(l => `<li draggable="true" data-name="${l.name}"><a href="${l.url}" target="_blank">${l.name}</a></li>`).join('')}
            </ul>
        `;
        linkList.appendChild(div);

        // Make links draggable
        const ul = div.querySelector("ul");
        let dragSrcEl = null;

        ul.querySelectorAll("li").forEach(li => {
            li.addEventListener("dragstart", e => {
                dragSrcEl = li;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/html", li.outerHTML);
            });

            li.addEventListener("dragover", e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            });

            li.addEventListener("drop", e => {
                e.stopPropagation();
                if (dragSrcEl !== li) {
                    li.insertAdjacentHTML('beforebegin', e.dataTransfer.getData("text/html"));
                    dragSrcEl.remove();
                    addDragEvents(); // Re-add events after drop
                }
            });
        });
    }

    // Collapse category toggle
    document.querySelectorAll(".category h3").forEach(h3 => {
        h3.addEventListener("click", () => h3.parentElement.classList.toggle("collapsed"));
    });
}

// Re-add drag events after moving items
function addDragEvents() {
    document.querySelectorAll("li").forEach(li => {
        li.addEventListener("dragstart", e => {
            dragSrcEl = li;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", li.outerHTML);
        });

        li.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });

        li.addEventListener("drop", e => {
            e.stopPropagation();
            if (dragSrcEl !== li) {
                li.insertAdjacentHTML('beforebegin', e.dataTransfer.getData("text/html"));
                dragSrcEl.remove();
                addDragEvents();
            }
        });
    });
}

// Filter links by search
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredLinks = allLinks.filter(
        link => link.name.toLowerCase().includes(query) ||
                (link.category && link.category.toLowerCase().includes(query)) ||
                link.url.toLowerCase().includes(query)
    );
    renderLinksByCategory(filteredLinks);
});

// Add new link to Google Sheets
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
        const res = await fetch(SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url, category })
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
    } catch (error) {
        formMessage.textContent = "Error adding link.";
        formMessage.style.color = "red";
        console.error(error);
    }
});

// Fetch links on page load
fetchLinks();