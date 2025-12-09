const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

async function loadProductsVinsi() {
    try {
        const res = await fetch("../JSON/productsVinsi72.json");
        const products = await res.json();
        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach((p) => {
            const div = document.createElement("div");
            div.className = "product";
            let price = p.price ? p.price + "€" : "Este producto no está disponible por ahora.";
            let btnText = isNaN(p.price) ? "Ver producto" : "Comprar producto";
            div.innerHTML = `
                    <img src="${p.images[0].url}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>${price}</p>
                    <button onclick="window.open('https://www.vinsi72.com${p.url}', '_blank')">${btnText}</button>
                    `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}