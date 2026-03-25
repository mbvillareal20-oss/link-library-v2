const API_URL = "https://script.google.com/macros/s/AKfycbyAVzfNUMS0Z23eIJqLJaK2x4o41Pd9XP9tlMBATi0LBdXPvrK2WlCet1K0-CwMoO-wtg/exec";

const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchLinks");

let allLinks = [];

async function fetchLinks() {
    try {
        const res = await fetch(API_URL);
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

function renderLinksByCategory(links) {
    const categories = {};
    links.forEach(link => {
        const cat = link.Category || "Uncategorized";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(link);
    });

    linkList.innerHTML = "";

    for (const cat in categories) {
        const div = document.createElement("div");
        div.className = "category";
        const ul = document.createElement("ul");

        categories[cat].forEach(link => {
            const li = document.createElement("li");
            li.draggable = true;
            li.dataset.id = link.ID;
            li.innerHTML = `<a href="${link.URL}" target="_blank">${link.Name}</a>`;
            ul.appendChild(li);
        });

        div.innerHTML = `<h3>${cat}</h3>`;
        div.appendChild(ul);
        linkList.appendChild(div);
    }

    document.querySelectorAll(".category h3").forEach(h3 => {
        h3.addEventListener("click", () => h3.parentElement.classList.toggle("collapsed"));
    });

    enableDragAndDrop();
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredLinks = allLinks.filter(
        link => link.Name.toLowerCase().includes(query) ||
                (link.Category && link.Category.toLowerCase().includes(query)) ||
                link.URL.toLowerCase().includes(query)
    );
    renderLinksByCategory(filteredLinks);
});

submitButton.addEventListener("click", async () => {
    const name = document.getElementById("newName").value.trim();
    const url = document.getElementById("newURL").value.trim();
    const category = document.getElementById("newCategory").value.trim();

    if (!name || !url) {
        formMessage.textContent = "Name and URL are required";
        formMessage.style.color = "red";
        return;
    }

    const fixedUrl = url.startsWith("http") ? url : "https://" + url;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url: fixedUrl, category })
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
            formMessage.textContent = `Error: ${result.error}`;
            formMessage.style.color = "red";
        }
    } catch (error) {
        formMessage.textContent = "Error adding link.";
        formMessage.style.color = "red";
        console.error(error);
    }
});

// ------------------ Drag-and-drop ------------------
function enableDragAndDrop() {
    let dragItem = null;

    document.querySelectorAll(".category ul").forEach(ul => {
        ul.addEventListener("dragstart", e => {
            dragItem = e.target;
            e.target.classList.add("dragging");
        });

        ul.addEventListener("dragover", e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(ul, e.clientY);
            if (!afterElement) ul.appendChild(dragItem);
            else ul.insertBefore(dragItem, afterElement);
        });

        ul.addEventListener("dragend", () => {
            dragItem.classList.remove("dragging");
            saveNewOrder(ul);
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveNewOrder(ul) {
    const items = [...ul.children];
    const updates = items.map((li, index) => ({ id: li.dataset.id, order: index + 1 }));
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
    });
}

// ------------------ Initial fetch ------------------
fetchLinks();