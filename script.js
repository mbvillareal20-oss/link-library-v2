const submitButton = document.getElementById("submitLink");
const formMessage = document.getElementById("formMessage");
const linkList = document.getElementById("linkList");

async function fetchLinks() {
    try {
        const res = await fetch("/api/links");
        const data = await res.json();
        linkList.innerHTML = "";

        if (data.length === 0) {
            linkList.innerHTML = "<p>No links yet.</p>";
            return;
        }

        data.forEach(link => {
            const div = document.createElement("div");
            div.className = "link-card";
            div.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a> <span>${link.category}</span>`;
            linkList.appendChild(div);
        });
    } catch (error) {
        linkList.innerHTML = `<p style="color:red;">Error fetching links</p>`;
        console.error(error);
    }
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

// Fetch links on load
fetchLinks();
