const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

const DEFAULT_PRODUCT_IMAGE = "/assets/logoPNGwhite.png";

function createImageElement(src, alt) {
    const img = document.createElement("img");
    img.src = src || DEFAULT_PRODUCT_IMAGE;
    img.alt = alt || "Producto";
    img.onerror = () => {
        img.onerror = null;
        img.src = DEFAULT_PRODUCT_IMAGE;
    };
    return img;
}

async function loadProductsVinsi() {
    try {
        let products;
        try {
            const res = await fetch("/api/mock/products/vinsi");
            if (!res.ok) throw new Error("API no disponible");
            products = await res.json();
        } catch {
            const res = await fetch("../JSON/productsVinsi72.json");
            products = await res.json();
        }

        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach((p) => {
            const div = document.createElement("div");
            div.className = "product";
            let price = p.price ? p.price + "€" : "Este producto no está disponible por ahora.";
            let btnText = isNaN(p.price) ? "Ver producto" : "Añadir al carrito";
            const imageUrl = p.images?.[0]?.url || DEFAULT_PRODUCT_IMAGE;

            const image = createImageElement(imageUrl, p.name);
            const title = document.createElement("h3");
            title.textContent = p.name;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
            const button = document.createElement("button");
            button.textContent = btnText;
            button.addEventListener("click", () => window.open(`https://www.vinsi72.com${p.url}`, "_blank"));

            div.append(image, title, priceEl, button);
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
        let data;
        try {
            const res = await fetch("/api/mock/products/bose");
            if (!res.ok) throw new Error("API no disponible");
            data = await res.json();
        } catch {
            const res = await fetch("../JSON/productsBose.json");
            data = await res.json();
        }
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
            const imgSrc = p.images?.[0]?.src || variant?.featured_image?.src || DEFAULT_PRODUCT_IMAGE;
            const productUrl = `https://bosecondieresis.net/products/${p.handle}`;

            const image = createImageElement(imgSrc, p.title);
            const title = document.createElement("h3");
            title.textContent = p.title;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
            const button = document.createElement("button");
            button.textContent = btnText;
            button.addEventListener("click", () => window.open(productUrl, "_blank"));

            div.append(image, title, priceEl, button);
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}

const _setupCrossfade = (img) => {
    const wrap = document.createElement("div");
    wrap.className = "img-crossfade-wrap";
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    // overlay = capa superior (frente); img = capa inferior (fondo, siempre opacity:1)
    // Solo se anima la capa superior 1→0, evitando el oscurecimiento por compositing
    const overlay = document.createElement("img");
    overlay.alt = img.alt;
    overlay.src = img.src;
    wrap.appendChild(overlay);

    return (newSrc) => {
        // Cargar nueva imagen en el fondo (oculta bajo el frente)
        img.src = newSrc;
        // Desvanecer el frente para revelar el fondo → crossfade sin oscurecimiento
        overlay.style.opacity = "0";
        setTimeout(() => {
            // Restaurar el frente instantáneamente al nuevo src (sin transición visible)
            overlay.src = newSrc;
            overlay.style.transition = "none";
            overlay.style.opacity = "1";
            requestAnimationFrame(() => requestAnimationFrame(() => {
                overlay.style.transition = "";
            }));
        }, 680);
    };
};

const cambiarImagenMerchan = () => {
    const img = document.getElementById("merchan");
    if (!img) return;
    const imagenes = [
        "../assets/merchan/bbo.jpg",
        "../assets/merchan/mgLogo.jpg",
        "../assets/merchan/peelingflesh.jpg"
    ];
    let indice = 0;
    const crossfade = _setupCrossfade(img);
    setInterval(() => {
        indice = (indice + 1) % imagenes.length;
        crossfade(imagenes[indice]);
    }, 5000);
};

const cambiarImagenIndie = () => {
    const img = document.getElementById("indie");
    if (!img) return;
    const imagenes = [
        "../assets/indie/0pulenz3.jpg",
        "../assets/indie/bosecondieresis.jpg",
        "../assets/indie/vinsi72.jpg"
    ];
    let indice = 0;
    const crossfade = _setupCrossfade(img);
    setTimeout(() => {
        setInterval(() => {
            indice = (indice + 1) % imagenes.length;
            crossfade(imagenes[indice]);
        }, 5000);
    }, 2500);
};

// ===== FORMULARIO DE CONTACTO =====
const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const artistInfoFieldset = document.getElementById("artistInfo");
    const brandInfoFieldset = document.getElementById("brandInfo");
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const successMessage = document.getElementById("successMessage");

    // Mostrar/ocultar campos según el tipo de usuario
    const updateFormFieldsVisibility = () => {
        const selectedType = document.querySelector('input[name="userType"]:checked')?.value;

        if (selectedType === "artist") {
            artistInfoFieldset.style.display = "block";
            brandInfoFieldset.style.display = "none";
            // Marcar campos de artista como requeridos
            document.getElementById("artistName").required = true;
            document.getElementById("genre").required = true;
            document.getElementById("bio").required = true;
        } else if (selectedType === "brand") {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "block";
            // Marcar campos de marca como requeridos
            document.getElementById("companyName").required = true;
            document.getElementById("industry").required = true;
            document.getElementById("brandBio").required = true;
        } else {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "none";
        }
    };

    // Event listeners para cambiar tipo de usuario
    userTypeRadios.forEach(radio => {
        radio.addEventListener("change", updateFormFieldsVisibility);
    });

    // Validación y envío del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar que se seleccionar tipo de usuario
        const selectedType = document.querySelector('input[name="userType"]:checked');
        if (!selectedType) {
            alert("Por favor, selecciona el tipo de usuario.");
            return;
        }

        // Validar al menos una opción de colaboración
        const collaborationCheckboxes = document.querySelectorAll('input[name="collaborationType"]');
        const anyCollaborationSelected = Array.from(collaborationCheckboxes).some(cb => cb.checked);
        if (!anyCollaborationSelected) {
            alert("Por favor, selecciona al menos un tipo de colaboración.");
            return;
        }

        // Validar archivo (si lo hay)
        const fileInput = document.getElementById("files");
        if (fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    alert(`El archivo "${file.name}" supera el tamaño máximo de 10MB.`);
                    return;
                }
            }
            if (fileInput.files.length > 5) {
                alert("No puedes adjuntar más de 5 archivos.");
                return;
            }
        }

        // Si todas las validaciones pasan, mostrar mensaje de éxito
        // En un caso real, aquí enviarías los datos al servidor
        console.log("Formulario válido. Datos listos para enviar:");
        const formData = new FormData(form);
        console.log(Object.fromEntries(formData));

        // Ocultar formulario y mostrar mensaje de éxito
        form.style.display = "none";
        successMessage.style.display = "block";

        // Opcional: Recargar después de 5 segundos
        setTimeout(() => {
            form.reset();
            form.style.display = "block";
            successMessage.style.display = "none";
        }, 5000);
    });

    // Mostrar contador de caracteres en los textareas
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach(textarea => {
        textarea.addEventListener("input", () => {
            const maxLength = textarea.getAttribute("maxlength");
            const currentLength = textarea.value.length;
            console.log(`${currentLength}/${maxLength} caracteres`);
        });
    });
};

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("contactForm")) {
        initContactForm();
    }
});

