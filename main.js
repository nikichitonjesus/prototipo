// main.js - Router principal con soporte para buscar.js y categorías

import { DATA, renderFeed, renderEpisodio, renderSerie, renderGrid, renderCategoryPills } from './show.js';
import { getEpisodioByDetailUrl, getSerieByUrl } from './episodios.js';
import './player.js';

// Páginas especiales (con header visible por defecto)
const PAGES = [
    { path: '/biblioteca', module: () => import('./biblioteca.js'), header: true },
    { path: '/explorar', module: () => import('./explorar.js'), header: true },
    { path: '/buscar', module: () => import('./buscar.js'), header: true }
];

let lastScrollTop = 0;

/**
 * Función principal de enrutamiento
 * Determina qué vista renderizar basada en la URL actual
 */
async function router() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const container = document.getElementById('content');
    const header = document.getElementById('main-header');
    const categoryFilters = document.getElementById('category-filters');

    // Mostrar header y filtros por defecto (luego cada vista puede ocultarlos)
    if (header) header.classList.remove('hidden');
    if (categoryFilters) categoryFilters.classList.remove('hidden');

    // 1. Ruta raíz → Feed
    if (path === '/') {
        renderFeed(container);
        document.title = 'Balta Media · Conocimiento en acción';
        // Asegurar que las categorías se muestren
        renderCategoryPills();
        return;
    }

    // 2. Páginas especiales (biblioteca, explorar, buscar)
    const page = PAGES.find(p => p.path === path);
    if (page) {
        const module = await page.module();
        // Las páginas especiales pueden tener su propio render
        // Para buscar, usamos renderSearch si hay query, sino render principal
        if (path === '/buscar') {
            const query = searchParams.get('q') || '';
            module.render(container, query); // buscar.js exporta render(query)
        } else {
            module.render(container);
        }
        document.title = `${page.path.slice(1).charAt(0).toUpperCase() + page.path.slice(2)} · Balta Media`;
        // Control de header según export 'header' del módulo
        if (module.header === false) {
            header.classList.add('hidden');
            categoryFilters.classList.add('hidden');
        } else {
            // Asegurar que las categorías se muestren si la página no las oculta
            renderCategoryPills();
        }
        return;
    }

    // 3. Búsqueda explícita con query (aunque ya lo cubre el case anterior, pero por si alguien escribe /buscar?q=...)
    if (path === '/buscar') {
        const buscarModule = await import('./buscar.js');
        const query = searchParams.get('q') || '';
        buscarModule.render(container, query);
        document.title = query ? `Búsqueda: ${query} · Balta Media` : 'Buscar · Balta Media';
        return;
    }

    // 4. Categoría (ej. /categoria/Derecho)
    if (path.startsWith('/categoria/')) {
        const cat = decodeURIComponent(path.replace('/categoria/', ''));
        const buscarModule = await import('./buscar.js');
        buscarModule.renderCategory(container, cat);
        document.title = `${cat} · Balta Media`;
        return;
    }

    // 5. Serie (por url_serie)
    const serie = getSerieByUrl(path);
    if (serie) {
        renderSerie(container, path);
        document.title = `${serie.titulo_serie} · Balta Media`;
        return;
    }

    // 6. Episodio (por detailUrl)
    const episodio = getEpisodioByDetailUrl(path);
    if (episodio) {
        renderEpisodio(container, episodio.id);
        document.title = `${episodio.title} · Balta Media`;
        return;
    }

    // 7. Novedades (ruta especial)
    if (path === '/novedades') {
        const sorted = [...DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recientes = sorted.slice(0, 20);
        const aleatorios = [...DATA].sort(() => 0.5 - Math.random()).slice(0, 10);
        const combined = [...new Set([...recientes, ...aleatorios])];
        renderGrid(container, combined, 'Novedades y Recomendaciones');
        document.title = 'Novedades · Balta Media';
        return;
    }

    // 8. No encontrado → 404
    const module404 = await import('./404.js');
    module404.render(container);
    document.title = 'Página no encontrada · Balta Media';
    if (module404.header === false) {
        header.classList.add('hidden');
        categoryFilters.classList.add('hidden');
    }
}

// ---- Navegación con History API ----
document.addEventListener('click', e => {
    const link = e.target.closest('a[data-link]');
    if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        window.history.pushState(null, null, href);
        router();
    }
});

// ---- Botón de cerrar grid (si existe) ----
document.addEventListener('click', e => {
    if (e.target.closest('#closeGridBtn')) {
        e.preventDefault();
        window.history.pushState(null, null, '/');
        router();
    }
});

// ---- Evento popstate (back/forward) ----
window.addEventListener('popstate', router);

// ---- Scroll: ocultar header al bajar, mostrarlo al subir ----
window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const topHeader = document.getElementById('main-header');
    if (!topHeader) return;

    if (st > lastScrollTop && st > 100) {
        topHeader.style.opacity = '0';
        topHeader.style.pointerEvents = 'none';
    } else {
        topHeader.style.opacity = '1';
        topHeader.style.pointerEvents = 'auto';
    }
    lastScrollTop = st <= 0 ? 0 : st;
});

// ---- Iniciar el router al cargar la página ----
router();

// ---- Exponer funciones globales necesarias (para eventos en tarjetas) ----
// Estas funciones ya están definidas en show.js, pero las referenciamos aquí
// para asegurar que están disponibles globalmente.
import { handlePlay, handleAdd, handleDl, goToDetail, shareContent } from './show.js';
window.handlePlay = handlePlay;
window.handleAdd = handleAdd;
window.handleDl = handleDl;
window.goToDetail = goToDetail;
window.shareContent = shareContent;
