// main.js
import { renderFeed } from './show.js';

// Mapa de rutas estáticas (páginas especiales)
const routes = [
    { path: '/', render: (container) => renderFeed(container) },
    { path: '/biblioteca', module: () => import('./biblioteca.js') },
    { path: '/explorar', module: () => import('./explorar.js') },
    { path: '/buscar', module: () => import('./buscar.js') },
];

// Función para manejar la navegación
async function router() {
    const path = window.location.pathname;
    const container = document.getElementById('content');

    // Buscar ruta estática exacta
    const route = routes.find(r => r.path === path);
    if (route) {
        if (route.render) {
            route.render(container);
        } else if (route.module) {
            const module = await route.module();
            module.render(container);
        }
        return;
    }

    // Manejar rutas dinámicas: /episodio/:slug y /serie/:slug
    const episodioMatch = path.match(/^\/episodio\/(.+)$/);
    if (episodioMatch) {
        const slug = episodioMatch[1];
        const { renderEpisodio } = await import('./show.js');
        renderEpisodio(container, slug);
        return;
    }

    const serieMatch = path.match(/^\/serie\/(.+)$/);
    if (serieMatch) {
        const slug = serieMatch[1];
        const { renderSerie } = await import('./show.js');
        renderSerie(container, slug);
        return;
    }

    // Si no coincide, intentar interpretar como posible serie o episodio directamente (sin prefijo)
    // Primero buscar episodio, luego serie
    const { getEpisodioBySlug, getSerieBySlug } = await import('./episodios.js');
    const slug = path.slice(1); // quitar barra inicial
    if (getEpisodioBySlug(slug)) {
        // Redirigir internamente a /episodio/slug
        window.history.replaceState(null, null, `/episodio/${slug}`);
        const { renderEpisodio } = await import('./show.js');
        renderEpisodio(container, slug);
        return;
    }
    if (getSerieBySlug(slug)) {
        window.history.replaceState(null, null, `/serie/${slug}`);
        const { renderSerie } = await import('./show.js');
        renderSerie(container, slug);
        return;
    }

    // Si nada, 404
    const module404 = await import('./404.js');
    module404.render(container);
}

// Escuchar clics en enlaces con data-link
document.addEventListener('click', e => {
    const link = e.target.closest('a[data-link]');
    if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        window.history.pushState(null, null, href);
        router();
    }
});

// Manejar navegación hacia atrás/adelante
window.addEventListener('popstate', router);

// Iniciar router al cargar la página
router();
