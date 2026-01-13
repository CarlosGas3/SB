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
            let btnText = isNaN(p.price) ? "Ver producto" : "Añadir al carrito";
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

async function loadProductsBose() {
    try {
        const res = await fetch("../JSON/productsBose.json");
        const data = await res.json();
        const products = data.products;
        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach((p) => {
            const div = document.createElement("div");
            div.className = "product";

            const variant = p.variants?.[0];

            const price = variant?.price
                ? variant.price + "€"
                : "Este producto no está disponible por ahora.";

            const btnText = variant?.price ? "Añadir al carrito" : "Ver producto";

            const imgSrc = p.images?.[0]?.src || "";

            const productUrl = `https://bosecondieresis.net/products/${p.handle}`;

            div.innerHTML = `
                <img src="${imgSrc}" alt="${p.title}">
                <h3>${p.title}</h3>
                <p>${price}</p>
                <button onclick="window.open('${productUrl}', '_blank')">
                    ${btnText}
                </button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}

const cambiarImagenMerchan = () => {
    const imagenes = [
        "../assets/merchan/bbo.jpg",
        "../assets/merchan/mgLogo.jpg",
        "../assets/merchan/peelingflesh.jpg"
    ];

    let indice = 0;
    const img = document.getElementById("merchan");

    img.style.width = "300px";
    img.style.height = "300px";
    img.style.objectFit = "cover";

    function cambiarImagenMerchan() {
        indice = (indice + 1) % imagenes.length;
        img.src = imagenes[indice];
    }

    setInterval(cambiarImagenMerchan, 10000);
}

const cambiarImagenIndie = () => {
    const imagenes = [
        "../assets/indie/0pulenz3.jpg",
        "../assets/indie/bosecondieresis.jpg",
        "../assets/indie/vinsi72.jpg"
    ];

    let indice = 0;
    const img = document.getElementById("indie");

    img.style.width = "300px";
    img.style.height = "300px";
    img.style.objectFit = "cover";

    function cambiarImagenIndie() {
        indice = (indice + 1) % imagenes.length;
        img.src = imagenes[indice];
    }

    setInterval(cambiarImagenIndie, 10000);
}