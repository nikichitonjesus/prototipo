// buscar.js
import { getAllEpisodios, getSerieByUrl } from './episodios.js';
import { createGridCard } from './show.js'; // reutilizamos la función de tarjeta

// Función para renderizar resultados de búsqueda
export function renderSearch(container, query) {
    container.innerHTML = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-8">Buscar</h1>
            <div class="flex gap-4 mb-8">
                <input type="text" id="searchPageInput" placeholder="Escribe tu búsqueda..." value="${query.replace(/"/g, '&quot;')}" class="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="searchPageBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition">Buscar</button>
            </div>
            <div id="searchPageResults" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
        </div>
    `;

    const input = document.getElementById('searchPageInput');
    const btn = document.getElementById('searchPageBtn');
    const resultsDiv = document.getElementById('searchPageResults');

    function performSearch() {
        const term = input.value.trim();
        if (!term) {
            resultsDiv.innerHTML = '';
            return;
        }
        const termLower = term.toLowerCase();
        const episodios = getAllEpisodios();
        const filtered = episodios.filter(ep =>
            ep.title.toLowerCase().includes(termLower) ||
            ep.author.toLowerCase().includes(termLower) ||
            ep.description.toLowerCase().includes(termLower)
        );

        if (filtered.length === 0) {
            resultsDiv.innerHTML = '<p class="text-gray-400 col-span-full">No se encontraron resultados.</p>';
            return;
        }

        resultsDiv.innerHTML = filtered.map(ep => createGridCard(ep)).join('');
        // Actualizar URL sin recargar
        window.history.replaceState(null, null, `/buscar?q=${encodeURIComponent(term)}`);
    }

    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });

    // Si hay query inicial, ejecutar búsqueda
    if (query.trim()) {
        input.value = query;
        performSearch();
    }
}

// Función para renderizar una categoría
export function renderCategory(container, category) {
    const episodios = getAllEpisodios().filter(ep => ep.categories.includes(category));
    container.innerHTML = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-8">${category}</h1>
            <div id="categoryResults" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
        </div>
    `;
    const resultsDiv = document.getElementById('categoryResults');
    if (episodios.length === 0) {
        resultsDiv.innerHTML = '<p class="text-gray-400 col-span-full">No hay episodios en esta categoría.</p>';
    } else {
        resultsDiv.innerHTML = episodios.map(ep => createGridCard(ep)).join('');
    }
}

export const header = true;
