document.addEventListener('DOMContentLoaded', function () {
    const artistSelect = document.getElementById('artist');
    const playerDiv = document.getElementById('spotify-player');

    function updatePlayer(artistId) {
        playerDiv.innerHTML = `
      <iframe
        style="border-radius:12px"
        src="https://open.spotify.com/embed/artist/${artistId}?utm_source=generator&theme=0"
        width="100%" height="380"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
      </iframe>
    `;
    }

    // Cargar el primer artista por defecto
    updatePlayer(artistSelect.value);

    // Cambiar de artista
    artistSelect.addEventListener('change', function () {
        updatePlayer(this.value);
    });
});
