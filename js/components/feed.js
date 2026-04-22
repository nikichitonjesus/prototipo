// feed.js - Vista del feed principal
import { createCarousel, createSeriesCarousel } from './js/components/carousel.js';
import { DATA, getRandomSafe } from './js/components/utils.js';

export function renderFeed(container) {
    let feedView = document.getElementById('feed-view');
    let gridView = document.getElementById('grid-view');
    if (!feedView) {
        container.innerHTML = `
            <div id="feed-view" class="space-y-8 sm:space-y-12 transition-opacity duration-300"></div>
            <div id="grid-view" class="hidden transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">Resultados</h2>
                    <button id="closeGridBtn" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"></div>
                <div id="empty-state" class="hidden py-8 sm:py-10 text-center">
                    <p class="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8" id="empty-msg">No encontramos nada...</p>
                    <h3 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Quizás te interese esto:</h3>
                    <div id="recommendations-grid" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"></div>
                </div>
            </div>
        `;
        feedView = document.getElementById('feed-view');
        gridView = document.getElementById('grid-view');
    }

    feedView.innerHTML = '';

    feedView.innerHTML += createCarousel("Destacados del Día", "vertical",
        getRandomSafe(15), "Todos", 'items');

    feedView.innerHTML += createCarousel("Nuevos Lanzamientos", "standard",
        getRandomSafe(15, ep => new Date(ep.date) > new Date(Date.now() - 30*24*60*60*1000)), "Todos", 'items');

    feedView.innerHTML += createCarousel("Series de Video", "expand",
        getRandomSafe(10, e => e.initialMode === 'video'), "Cine y TV", 'category');

    feedView.innerHTML += createCarousel("Top Semanal", "list",
        getRandomSafe(16), "Todos", 'items');

    feedView.innerHTML += createCarousel("Para Estudiar Profundamente", "double",
        getRandomSafe(20, e => e.categories.includes("Matemáticas") || e.categories.includes("Física y Astronomía")), "Matemáticas", 'category');

    feedView.innerHTML += createCarousel("Matemáticas", "standard",
        getRandomSafe(15, e => e.categories.includes("Matemáticas")), "Matemáticas", 'category');

    feedView.innerHTML += createCarousel("Especiales en Video", "expand",
        getRandomSafe(10, e => e.initialMode === 'video' && e.categories.includes("Documentales")), "Documentales", 'category');

    feedView.innerHTML += createCarousel("Física y Astronomía", "standard",
        getRandomSafe(15, e => e.categories.includes("Física y Astronomía")), "Física y Astronomía", 'category');

    feedView.innerHTML += createCarousel("Ciencias Naturales y Tecnología", "double",
        getRandomSafe(20, e => e.categories.some(c => ["Ciencias Naturales", "Tecnología e Informática"].includes(c))), "Otras Ciencias", 'category');

    feedView.innerHTML += createSeriesCarousel();

    feedView.innerHTML += createCarousel("Otras Ciencias y Disciplinas", "standard",
        getRandomSafe(15, e => e.categories.includes("Otras Ciencias") ||
            e.categories.some(c => ["Ciencias Naturales", "Tecnología e Informática"].includes(c))),
        "Otras Ciencias", 'category');

    feedView.innerHTML += createCarousel("Imprescindibles del Mes", "list",
        getRandomSafe(16, e => new Date(e.date) > new Date(Date.now() - 60*24*60*60*1000)), "Todos", 'items');

    feedView.innerHTML += createCarousel("Podcasts Destacados", "standard",
        getRandomSafe(15, e => e.initialMode === 'audio'), "Todos", 'items');

    feedView.innerHTML += createCarousel("Charlas y Conferencias", "expand",
        getRandomSafe(10, e => e.initialMode === 'video' && (e.categories.includes("Cine y TV") || e.categories.includes("Documentales"))), "Cine y TV", 'category');

    feedView.innerHTML += createCarousel("Mentes Curiosas", "standard",
        getRandomSafe(15, e =>
            /\b(investigación|investigacion|criminalística|criminalistica|crimen|delito|forense|guerra|conflicto|violencia|seguridad|policía|policia|detective|asesinato|homicidio|justicia|penal|legal|sociedad|problema social)\b/i
            .test(e.title + ' ' + e.description + ' ' + (e.series?.titulo_serie || ''))
        ), "Derecho", 'category');

    feedView.innerHTML += createCarousel("Mix de Saberes", "double",
        getRandomSafe(20), "Todos", 'items');
}
