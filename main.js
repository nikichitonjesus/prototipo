// main.js - Router principal

// Mapa de rutas estáticas
const routes = [
    { path: '/', module: () => import('./show.js'), render: 'renderFeed' },
    { path: '/biblioteca', module: () => import('./biblioteca.js') },
    { path: '/explorar', module: () => import('./explorar.js') },
    { path: '/buscar', module: () => import('./buscar.js') }
];

// Función para manejar la navegación
async function router() {
    const path = window.location.pathname;
    const container = document.getElementById('content');
    const header = document.getElementById('main-header');

    // Limpiar clases de ocultar header
    if (header) header.classList.remove('header-hidden');

    // 1. Buscar ruta estática exacta
    const route = routes.find(r => r.path === path);
    if (route) {
        const module = await route.module();
        if (route.render) {
            // Si es show.js, llamamos a la función específica (renderFeed)
            module[route.render](container);
        } else {
            module.render(container);
        }
        // Controlar visibilidad del header según export 'header'
        if (module.header === false) {
            header.classList.add('header-hidden');
        }
        return;
    }

    // 2. Manejar rutas dinámicas: /episodio/:id
    const episodioMatch = path.match(/^\/episodio\/(.+)$/);
    if (episodioMatch) {
        const id = episodioMatch[1];
        const showModule = await import('./show.js');
        showModule.renderEpisodio(container, id);
        // Los episodios muestran header por defecto
        header.classList.remove('header-hidden');
        return;
    }

    // 3. Serie: la url de serie puede ser como /teoria-del-proceso (sin prefijo)
    // También puede ser con prefijo /serie/...
    const serieMatch = path.match(/^\/serie\/(.+)$/);
    if (serieMatch) {
        const serieUrl = '/' + serieMatch[1];
        const showModule = await import('./show.js');
        showModule.renderSerie(container, serieUrl);
        header.classList.remove('header-hidden');
        return;
    }

    // 4. Intentar interpretar como serie sin prefijo (p.ej. /ddpp-3/clases)
    // Importar episodios para ver si existe serie con esa url
    const { getSerieByUrl } = await import('./episodios.js');
    if (getSerieByUrl(path)) {
        // Redirigir internamente a /serie/...
        const showModule = await import('./show.js');
        showModule.renderSerie(container, path);
        // Actualizar URL sin recargar (opcional)
        window.history.replaceState(null, null, path);
        header.classList.remove('header-hidden');
        return;
    }

    // 5. Si no es nada, 404
    const module404 = await import('./404.js');
    module404.render(container);
    if (module404.header === false) {
        header.classList.add('header-hidden');
    }
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
