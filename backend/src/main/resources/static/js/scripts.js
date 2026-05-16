const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

async function loadProductsVinsi() {
    try {
        const res = await fetch("/api/mock/products/vinsi");
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
        const res = await fetch("/api/mock/products/bose");
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