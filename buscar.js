// buscar.js
import { DATA, createGridCard } from './show.js';

const CATEGORIES = [
    "Todos",
    "Derecho",
    "Física y Astronomía",
    "Matemáticas",
    "Historia",
    "Filosofía",
    "Economía y Finanzas",
    "Ciencias Sociales",
    "Arte y Cultura",
    "Literatura y Audiolibros",
    "Cine y TV",
    "Documentales",
    "Ciencias Naturales",
    "Tecnología e Informática",
    "Otras Ciencias"
];

const categoryColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'
];

// Vista principal
function renderMainView(container) {
    const html = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-8">Buscar</h1>
            <div class="flex gap-4 mb-12">
                <input type="text" id="searchMainInput" placeholder="Escribe tu búsqueda..." class="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="searchMainBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition">Buscar</button>
            </div>
            <h2 class="text-2xl font-bold mb-6">Categorías destacadas</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                ${CATEGORIES.filter(cat => cat !== 'Todos').map((cat, index) => `
                    <a href="/categoria/${encodeURIComponent(cat)}" data-link class="block p-6 rounded-xl text-white font-bold text-center transition transform hover:scale-105 ${categoryColors[index % categoryColors.length]}">
                        ${cat}
                    </a>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;

    const input = document.getElementById('searchMainInput');
    const btn = document.getElementById('searchMainBtn');

    function performSearch() {
        const query = input.value.trim();
        if (query) {
            window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
        }
    }

    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
}

// Vista de categoría
function renderCategoryView(container, category) {
    const filtered = DATA.filter(ep => 
        ep.categories && ep.categories.some(c => c.toLowerCase() === category.toLowerCase())
    );
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let suggestionsHtml = '';
    if (filtered.length === 0) {
        const otherEpisodios = DATA.filter(ep => 
            !ep.categories.some(c => c.toLowerCase() === category.toLowerCase())
        );
        const random = [...otherEpisodios].sort(() => 0.5 - Math.random()).slice(0, 8);
        suggestionsHtml = `
            <div class="mt-12">
                <h3 class="text-xl font-bold mb-4">Quizás te interese:</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${random.map(ep => createGridCard(ep)).join('')}
                </div>
            </div>
        `;
    }

    const html = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-4">${category}</h1>
            <p class="text-gray-400 mb-8">${filtered.length} episodios encontrados</p>
            
            <div id="categoryResults" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${filtered.length > 0 ? filtered.map(ep => createGridCard(ep)).join('') : '<p class="text-gray-400 col-span-full">No hay episodios en esta categoría.</p>'}
            </div>
            
            ${suggestionsHtml}
        </div>
    `;

    container.innerHTML = html;
}

// Vista de resultados de búsqueda
function renderSearchResultsView(container, query) {
    const term = query.toLowerCase().trim();
    const filtered = DATA.filter(ep =>
        ep.title.toLowerCase().includes(term) ||
        ep.author.toLowerCase().includes(term) ||
        ep.description.toLowerCase().includes(term)
    );
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let suggestionsHtml = '';
    if (filtered.length === 0) {
        const random = [...DATA].sort(() => 0.5 - Math.random()).slice(0, 8);
        suggestionsHtml = `
            <div class="mt-12">
                <h3 class="text-xl font-bold mb-4">Quizás te interese:</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${random.map(ep => createGridCard(ep)).join('')}
                </div>
            </div>
        `;
    }

    const html = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-4">Resultados para "${query}"</h1>
            <p class="text-gray-400 mb-8">${filtered.length} episodios encontrados</p>
            
            <div id="searchResults" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${filtered.length > 0 ? filtered.map(ep => createGridCard(ep)).join('') : '<p class="text-gray-400 col-span-full">No se encontraron resultados.</p>'}
            </div>
            
            ${suggestionsHtml}
        </div>
    `;

    container.innerHTML = html;
}

// Exportar función principal
export function render(container, query) {
    if (query && query.trim() !== '') {
        renderSearchResultsView(container, query);
    } else {
        renderMainView(container);
    }
}

export function renderCategory(container, category) {
    renderCategoryView(container, category);
}

export const header = true;
