const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");

async function fetchLinks() {
    try {
        const res = await fetch("/api/links");
        const data = await res.json();

        if (!Array.isArray(data)) {
            linkList.innerHTML = `<p class="error">Error: Invalid data received</p>`;
            return;
        }

        renderLinksByCategory(data);
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
            <ul>
                ${categories[cat].map(l => `<li><a href="${l.url}" target="_blank">${l.name}</a></li>`).join('')}
            </ul>
        `;
        linkList.appendChild(div);
    }

    // Add toggle functionality for categories
    document.querySelectorAll(".category h3").forEach(h3 => {
        h3.addEventListener("click", () => h3.parentElement.classList.toggle("collapsed"));
    });
}

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
        const res = await fetch("/api/links", {
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
            formMessage.textContent = `Error: ${result.error}`;
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
