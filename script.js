document.addEventListener('DOMContentLoaded', () => {

    // Elementos del DOM
    const themeToggle = document.getElementById('theme-toggle');
    const charactersContainer = document.getElementById('characters-container');
    const paginationContainer = document.querySelector('.pagination');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // Estado de la paginación
    let nextPage = null;
    let prevPage = null;
    const initialUrl = 'https://rickandmortyapi.com/api/character';

    // --- Lógica para el Tema Oscuro/Claro ---
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', themeToggle.checked);
    });

    // --- Lógica para la API, Paginación y Búsqueda ---

    const renderCharacters = (results) => {
        charactersContainer.innerHTML = '';
        if (!results || results.length === 0) {
            charactersContainer.innerHTML = '<p>No se encontraron personajes con ese nombre.</p>';
            return;
        }
        results.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <img src="${character.image}" alt="Imagen de ${character.name}">
                <h3>${character.name}</h3>
                <div class="character-details">
                    <p><strong>Estado:</strong> ${character.status}</p>
                    <p><strong>Especie:</strong> ${character.species}</p>
                    <p><strong>Origen:</strong> ${character.origin.name}</p>
                </div>
            `;
            charactersContainer.appendChild(card);
        });
    };

    const loadCharacters = (url) => {
        charactersContainer.innerHTML = '<p>Cargando personajes...</p>';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        renderCharacters([]); // Llama a render con array vacío para mostrar mensaje
                        paginationContainer.style.display = 'none'; // Oculta paginación si no hay resultados
                    }
                    throw new Error('La respuesta de la red no fue correcta.');
                }
                return response.json();
            })
            .then(data => {
                renderCharacters(data.results);
                
                if (data.info && data.info.pages > 1) {
                    paginationContainer.style.display = 'flex';
                    nextPage = data.info.next;
                    prevPage = data.info.prev;
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const currentPage = parseInt(urlParams.get('page')) || 1;
                    pageInfo.textContent = `Página ${currentPage} de ${data.info.pages}`;
                    prevPageButton.disabled = !prevPage;
                    nextPageButton.disabled = !nextPage;
                } else {
                    paginationContainer.style.display = 'none';
                }
                
                window.scrollTo(0, 0);
            })
            .catch(error => {
                console.error('Error al obtener los personajes:', error);
                if (!charactersContainer.querySelector('p')) {
                    charactersContainer.innerHTML = '<p>No se pudieron cargar los personajes. Inténtalo de nuevo más tarde.</p>';
                }
            });
    };

    
    nextPageButton.addEventListener('click', () => {
        if (nextPage) loadCharacters(nextPage);
    });

    prevPageButton.addEventListener('click', () => {
        if (prevPage) loadCharacters(prevPage);
    });

    // Event Listener para el formulario de búsqueda
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            loadCharacters(`https://rickandmortyapi.com/api/character/?name=${searchTerm}`);
        } else {
            
            loadCharacters(initialUrl);
        }
    });

    // Carga inicial
    loadCharacters(initialUrl);
});