// show.js - Vistas del feed, episodio y serie

import { episodios, getAllEpisodios, getEpisodioById, getEpisodiosBySerieUrl, getSerieByUrl } from './episodios.js';
import { userStorage } from './storage.js';
import './player.js'; // Asegura que el reproductor esté disponible

// ---------- CONSTANTES ----------
const ICONS = {
    play: 'https://marca1.odoo.com/web/image/508-f876320c/play.svg',
    pause: 'https://marca1.odoo.com/web/image/508-f876320c/pause.svg', // asumimos existe
    add: 'https://marca1.odoo.com/web/image/509-c555b4ef/a%C3%B1adir%20a.svg',
    added: 'https://nikichitonjesus.odoo.com/web/image/1112-d141b3eb/a%C3%B1adido.png',
    dl: 'https://marca1.odoo.com/web/image/510-7a9035c1/descargar.svg',
    noDl: 'https://nikichitonjesus.odoo.com/web/image/1051-622a3db3/no-desc.webp'
};

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

// ---------- FUNCIONES DE CATEGORIZACIÓN ----------
function determineCategories(ep) {
    const cats = new Set();
    const text = (ep.title + ' ' + ep.description + ' ' + (ep.series?.titulo_serie || '') + ' ' + (ep.series?.descripcion_serie || '')).toLowerCase();

    const patterns = {
        "Derecho": /\b(derecho|penal|civil|constitucional|procesal|delito|ley|jurisprudencia|código|tribunal|justicia|proceso)\b/i,
        "Física y Astronomía": /\b(física|fisica|mecánica|mecanica|cuántica|cuantica|termodinámica|termodinamica|newton|einstein|astronomía|astronomia|planeta|cosmos)\b/i,
        "Matemáticas": /\b(matemática|matematicas|calculo|cálculo|algebra|álgebra|geometria|geometría|estadistica|estadística|probabilidad|ecuacion|ecuación|teorema|integral)\b/i,
        "Historia": /\b(historia|histórico|historico|siglo|época|epoca|imperio|guerra|revolución|revolucion|antiguo|medieval)\b/i,
        "Filosofía": /\b(filosofía|filosofia|kant|platon|platón|aristoteles|ética|etica|metafísica|metafisica|ontología|ontologia|epistemología|epistemologia)\b/i,
        "Economía y Finanzas": /\b(economía|economia|finanzas|inflación|inflacion|keynes|oferta|demanda|macroeconomía|macroeconomia|pib|mercado)\b/i,
        "Ciencias Sociales": /\b(sociología|sociologia|antropología|antropologia|psicología|psicologia|sociedad|cultura|identidad|género|genero|desigualdad)\b/i,
        "Arte y Cultura": /\b(arte|pintura|escultura|arquitectura|renacimiento|barroco|música|musica|cultura|artístico|artistico)\b/i,
        "Literatura y Audiolibros": /\b(audiolibro|libro|novela|cuento|poema|clásico|clasico|literatura|lectura)\b/i,
        "Cine y TV": /\b(cine|película|pelicula|serie|director|guion|ficción|ficcion|animación|animacion)\b/i,
        "Documentales": /\b(documental|bbc|ciencia|naturaleza|espacio|universo|planeta|nacional geographic)\b/i,
        "Ciencias Naturales": /\b(biología|biologia|química|quimica|geología|geologia|ecología|ecologia|evolución|evolucion|genética|genetica|clima|botánica|botanica)\b/i,
        "Tecnología e Informática": /\b(tecnología|tecnologia|programación|programacion|python|ia|computación|computacion|algoritmo|software|desarrollo)\b/i
    };

    for (const [cat, regex] of Object.entries(patterns)) {
        if (regex.test(text)) cats.add(cat);
    }

    if (ep.type === 'video') {
        if (text.includes('documental')) cats.add("Documentales");
        else cats.add("Cine y TV");
    }

    if (cats.size === 0) cats.add("Otras Ciencias");

    return Array.from(cats);
}

// Procesar episodios con categorías
const DATA = episodios.map((ep, i) => ({
    ...ep,
    categories: determineCategories(ep),
    // Para compatibilidad con el código original
    coverWide: ep.coverUrl2 || ep.coverUrl
}));

// ---------- VARIABLES GLOBALES (para funciones expuestas) ----------
let currentView = 'feed';
let lastScrollTop = 0;
let searchTimeout = null;

// ---------- RENDERIZADO DE CATEGORÍAS ----------
function renderCategoryPills(activeCat = 'Todos') {
    const container = document.getElementById('category-pills');
    if (!container) return;
    container.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const isActive = cat === activeCat;
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;
        btn.innerText = cat;
        btn.onclick = () => filterByCategory(cat);
        container.appendChild(btn);
    });
}

// ---------- FUNCIONES DE AYUDA PARA CARRUSELES ----------
function createStandardCard(ep) {
    const isInPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = isInPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;

    return `<div class="card-std group" data-episodio-id="${ep.id}">
        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="overlay-full">
                <img src="${addIcon}" class="action-icon" onclick="window.handleAdd(event, '${ep.id}'); return false;" data-episodio-id="${ep.id}" data-added="${isInPlaylist}">
                <img src="${ICONS.play}" class="play-icon-lg" onclick="window.handlePlay(event, '${ep.id}'); return false;">
                <img src="${dlIcon}" class="action-icon" onclick="window.handleDl(event, '${ep.id}'); return false;" title="${ep.allowDownload ? 'Descargar' : 'Descarga no disponible'}">
            </div>
            <div class="mobile-play-button" onclick="window.handlePlay(event, '${ep.id}'); return false;">
                <img src="${ICONS.play}" alt="Play">
            </div>
        </div>
        <div onclick="window.goToDetail('${ep.detailUrl}')">
            <h3 class="font-bold text-white text-sm truncate">${ep.title}</h3>
            <p class="text-xs text-gray-400 mt-1 truncate">${ep.author}</p>
        </div>
    </div>`;
}

function createVideoExpand(ep) {
    const isInPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = isInPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const hasCover2 = ep.coverWide && ep.coverWide !== ep.coverUrl;

    return `<div class="card-video group" data-episodio-id="${ep.id}">
        <img src="${ep.coverUrl}" class="absolute inset-0 w-full h-full object-cover z-10 group-hover:opacity-0 transition-opacity duration-300">
        ${hasCover2 ? `<img src="${ep.coverWide}" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300">` : ''}
        <div class="overlay-full z-20">
            <img src="${addIcon}" class="action-icon" onclick="window.handleAdd(event, '${ep.id}'); return false;" data-episodio-id="${ep.id}" data-added="${isInPlaylist}">
            <img src="${ICONS.play}" class="play-icon-lg" onclick="window.handlePlay(event, '${ep.id}'); return false;">
            <img src="${dlIcon}" class="action-icon" onclick="window.handleDl(event, '${ep.id}'); return false;" title="${ep.allowDownload ? 'Descargar' : 'Descarga no disponible'}">
        </div>
        <div class="mobile-play-button z-30" onclick="window.handlePlay(event, '${ep.id}'); return false;">
            <img src="${ICONS.play}" alt="Play">
        </div>
        <div class="absolute bottom-2 left-2 z-20 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold">VIDEO</div>
    </div>`;
}

function createListItem(ep, idx) {
    const isInPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = isInPlaylist ? ICONS.added : ICONS.add;

    return `<div class="list-item group" data-episodio-id="${ep.id}">
        <span class="text-gray-500 font-bold w-4 text-center text-sm">${idx + 1}</span>
        <div class="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover" loading="lazy">
            <div class="overlay-mini" onclick="window.handlePlay(event, '${ep.id}'); return false;"><img src="${ICONS.play}" class="play-icon-sm"></div>
        </div>
        <div class="flex-1 min-w-0" onclick="window.goToDetail('${ep.detailUrl}')">
            <h4 class="font-bold text-sm truncate text-white">${ep.title}</h4>
            <p class="text-xs text-gray-500 truncate">${ep.author}</p>
        </div>
        <button class="hidden lg:group-hover:block opacity-60 hover:opacity-100 pr-2" onclick="window.handleAdd(event, '${ep.id}'); return false;">
            <img src="${addIcon}" alt="Agregar" class="w-5 h-5" data-episodio-id="${ep.id}" data-added="${isInPlaylist}">
        </button>
        <div class="lg:hidden mobile-play-button" style="position: static; margin-right: 8px;" onclick="window.handlePlay(event, '${ep.id}'); return false;">
            <img src="${ICONS.play}" alt="Play" class="w-4 h-4">
        </div>
    </div>`;
}

function createCarousel(title, type, items, categoryContext) {
    if (!items || items.length === 0) return '';

    const id = 'c-' + Math.random().toString(36).substr(2, 9);
    let content = '';

    if (type === 'double') {
        content = `<div id="${id}" class="flex flex-col flex-wrap h-[580px] gap-x-6 gap-y-6 overflow-x-auto no-scrollbar scroll-smooth">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    } else if (type === 'list') {
        content = `<div id="${id}" class="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;
        for (let i = 0; i < items.length; i += 4) {
            content += `<div class="card-list-group">` +
                (items[i] ? createListItem(items[i], i) : '') +
                (items[i+1] ? createListItem(items[i+1], i+1) : '') +
                (items[i+2] ? createListItem(items[i+2], i+2) : '') +
                (items[i+3] ? createListItem(items[i+3], i+3) : '') +
                `</div>`;
        }
        content += `</div>`;
    } else if (type === 'expand') {
        content = `<div id="${id}" class="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createVideoExpand(ep)).join('') +
            `</div>`;
    } else {
        content = `<div id="${id}" class="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    }

    return `<section class="carousel-wrapper relative group/section">
        <div class="flex items-end justify-between mb-5 px-1">
            <h2 class="text-2xl font-bold tracking-tight text-white hover:text-blue-500 transition-colors">${title}</h2>
            <button onclick="window.filterByCategory('${categoryContext}')" class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white">Ver todo</button>
        </div>
        <div class="relative">
            <div class="nav-btn left" onclick="document.getElementById('${id}').scrollLeft -= 600"><button>❮</button></div>
            ${content}
            <div class="nav-btn right" onclick="document.getElementById('${id}').scrollLeft += 600"><button>❯</button></div>
        </div>
    </section>`;
}

function createSeriesCarousel() {
    const id = 'c-series-' + Math.random().toString(36).substr(2, 9);
    const seriesGroups = {};
    DATA.forEach(ep => {
        if (ep.series && ep.series.titulo_serie) {
            const serieKey = ep.series.url_serie;
            if (!seriesGroups[serieKey]) {
                seriesGroups[serieKey] = { episodes: [], seriesInfo: ep.series };
            }
            seriesGroups[serieKey].episodes.push(ep);
        }
    });

    const seriesKeys = Object.keys(seriesGroups);
    if (seriesKeys.length === 0) return '';

    let content = `<div id="${id}" class="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;

    seriesKeys.forEach(serieKey => {
        const group = seriesGroups[serieKey];
        group.episodes.sort((a, b) => new Date(b.date) - new Date(a.date));
        const s = group.seriesInfo;
        if (!s || group.episodes.length < 1) return;

        content += `<div class="card-list-group">
            <div class="mb-4 cursor-pointer" onclick="window.goToDetail('${s.url_serie}')">
                <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800">
                    <img src="${s.portada_serie}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <h3 class="font-bold text-white text-sm truncate mt-2">${s.titulo_serie}</h3>
                <p class="text-xs text-gray-400">ver serie</p>
            </div>`;

        group.episodes.slice(0, 4).forEach((ep, i) => {
            content += createListItem(ep, i);
        });

        content += `</div>`;
    });

    content += `</div>`;

    return `<section class="carousel-wrapper relative group/section">
        <div class="flex items-end justify-between mb-5 px-1">
            <h2 class="text-2xl font-bold tracking-tight text-white hover:text-blue-500 transition-colors">Series y Cursos Académicos</h2>
            <button class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white">Ver todo</button>
        </div>
        <div class="relative">
            <div class="nav-btn left" onclick="document.getElementById('${id}').scrollLeft -= 600"><button>❮</button></div>
            ${content}
            <div class="nav-btn right" onclick="document.getElementById('${id}').scrollLeft += 600"><button>❯</button></div>
        </div>
    </section>`;
}

// ---------- FUNCIONES DE INTERACCIÓN (expuestas globalmente) ----------
window.handlePlay = function(e, episodioId) {
    e.stopPropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep) return;

    if (typeof window.playEpisodeExpanded === 'function') {
        window.playEpisodeExpanded(
            ep.mediaUrl,
            ep.type,
            ep.coverUrl,
            ep.coverUrl,
            ep.title,
            ep.detailUrl,
            ep.author,
            [],
            ep.description,
            ep.allowDownload
        );
    } else {
        // Fallback
        window.open(ep.mediaUrl, '_blank');
    }
    return false;
};

window.handleAdd = function(e, episodioId) {
    e.stopPropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep) return;

    const added = userStorage.playlist.add(ep);
    // Actualizar icono
    const target = e.target.closest('img');
    if (target) {
        target.src = ICONS.added;
        target.dataset.added = 'true';
        target.style.transform = 'scale(1.2)';
        setTimeout(() => target.style.transform = 'scale(1)', 200);
    }
    return false;
};

window.handleDl = function(e, episodioId) {
    e.stopPropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep) return;

    if (!ep.allowDownload) {
        alert('Descarga no disponible para este episodio');
        return false;
    }

    const ext = ep.type === 'video' ? 'mp4' : 'mp3';
    const filename = `${ep.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.${ext}`;

    try {
        const a = document.createElement('a');
        a.href = ep.mediaUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        window.open(ep.mediaUrl, '_blank');
    }
    return false;
};

window.goToDetail = function(url) {
    if (url && url !== '#') {
        // Navegar con History API
        window.history.pushState(null, null, url);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
};

// Funciones de búsqueda y filtrado
window.filterByCategory = function(cat) {
    renderCategoryPills(cat);
    if (cat === 'Todos') {
        window.showFeed();
        return;
    }
    const results = DATA.filter(ep => ep.categories.includes(cat));
    renderGrid(results, cat);
};

window.showFeed = function() {
    toggleView('feed');
    closeSearch();
};

function toggleView(view) {
    const feed = document.getElementById('feed-view');
    const grid = document.getElementById('grid-view');
    if (!feed || !grid) return;

    if (view === 'grid') {
        feed.classList.add('hidden');
        grid.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        feed.classList.remove('hidden');
        grid.classList.add('hidden');
        // Limpiar búsqueda
        const desktopSearch = document.getElementById('desktopSearch');
        if (desktopSearch) desktopSearch.value = '';
        const mobileInput = document.getElementById('mobileSearchInput');
        if (mobileInput) mobileInput.value = '';
        renderCategoryPills('Todos');
    }
    currentView = view;
}

function renderGrid(items, title) {
    toggleView('grid');
    const gridContainer = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const titleEl = document.getElementById('grid-title');
    if (!gridContainer || !emptyState || !titleEl) return;

    titleEl.innerText = title;
    gridContainer.innerHTML = '';

    if (items.length === 0) {
        emptyState.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        const searchTerm = title.replace('Resultados para ', '').replace(/"/g, '');
        document.getElementById('empty-msg').innerText = `No hemos encontrado nada para "${searchTerm}"`;

        const suggestions = [...DATA].sort(() => 0.5 - Math.random()).slice(0, 5);
        const recGrid = document.getElementById('recommendations-grid');
        recGrid.innerHTML = '';
        suggestions.forEach(ep => {
            recGrid.innerHTML += createGridCard(ep);
        });
    } else {
        emptyState.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        items.forEach(item => {
            gridContainer.innerHTML += createGridCard(item);
        });
    }
}

function createGridCard(item) {
    const isInPlaylist = userStorage.playlist.has(item.id);
    const addIcon = isInPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = item.allowDownload ? ICONS.dl : ICONS.noDl;

    return `
        <div class="grid-card group" data-episodio-id="${item.id}">
            <div class="aspect-square bg-zinc-800 relative" onclick="window.goToDetail('${item.detailUrl}')">
                <img src="${item.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="overlay-full">
                    <img src="${addIcon}" class="action-icon" onclick="window.handleAdd(event, '${item.id}'); return false;" data-episodio-id="${item.id}" data-added="${isInPlaylist}">
                    <img src="${ICONS.play}" class="play-icon-lg" onclick="window.handlePlay(event, '${item.id}'); return false;">
                    <img src="${dlIcon}" class="action-icon" onclick="window.handleDl(event, '${item.id}'); return false;" title="${item.allowDownload ? 'Descargar' : 'Descarga no disponible'}">
                </div>
                <div class="mobile-play-button" onclick="window.handlePlay(event, '${item.id}'); return false;">
                    <img src="${ICONS.play}" alt="Play">
                </div>
            </div>
            <div onclick="window.goToDetail('${item.detailUrl}')">
                <h4 class="font-bold text-sm text-white truncate">${item.title}</h4>
                <p class="text-xs text-gray-500 truncate">${item.author}</p>
            </div>
        </div>
    `;
}

// Funciones de búsqueda (llamadas desde index.html)
window.handleDesktopSearchInput = function(query) {
    clearTimeout(searchTimeout);
    if (!query || query.trim() === '') {
        clearDesktopSearchResults();
        return;
    }
    searchTimeout = setTimeout(() => {
        const results = performQuickSearch(query);
        renderDesktopSearchResults(results, query);
    }, 300);
};

window.handleDesktopSearchEnter = function(event) {
    event.preventDefault();
    const query = document.getElementById('desktopSearch').value.trim();
    if (query) {
        performFullSearch(query);
        hideDesktopSearchResults();
    }
};

window.showDesktopSearchResults = function() {
    const results = document.getElementById('desktopSearchResults');
    if (results) results.classList.add('active');
};

function hideDesktopSearchResults() {
    setTimeout(() => {
        const results = document.getElementById('desktopSearchResults');
        if (results) results.classList.remove('active');
    }, 200);
}

function performQuickSearch(query) {
    const term = query.toLowerCase().trim();
    return DATA.filter(ep =>
        ep.title.toLowerCase().includes(term) ||
        ep.author.toLowerCase().includes(term) ||
        ep.categories.some(c => c.toLowerCase().includes(term)) ||
        ep.description.toLowerCase().includes(term)
    ).slice(0, 5);
}

function renderDesktopSearchResults(results, query) {
    const container = document.getElementById('desktopSearchResultsContent');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-gray-400"><p>No encontramos resultados para "${query}"</p></div>`;
        return;
    }

    container.innerHTML = results.map(ep => `
        <div class="search-result-item" onclick="window.goToDetail('${ep.detailUrl}'); hideDesktopSearchResults()">
            <div class="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img src="${ep.coverUrl}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm text-white truncate">${ep.title}</h4>
                <p class="text-xs text-gray-400 truncate">${ep.author} • ${ep.type === 'video' ? 'Video' : 'Audio'}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML += `
        <div class="search-result-item mt-2 border-t border-white/10 pt-2" onclick="window.performFullSearch('${query}'); hideDesktopSearchResults()">
            <div class="flex items-center justify-center w-full">
                <span class="text-blue-400 font-bold text-sm">Ver todos los resultados para "${query}"</span>
            </div>
        </div>
    `;
}

function clearDesktopSearchResults() {
    const container = document.getElementById('desktopSearchResultsContent');
    if (container) container.innerHTML = '';
    hideDesktopSearchResults();
}

window.performFullSearch = function(query) {
    performSearch(query);
    hideDesktopSearchResults();
};

function performSearch(query) {
    if (!query || query.trim() === '') {
        window.showFeed();
        return;
    }
    const term = query.toLowerCase().trim();
    const results = DATA.filter(ep =>
        ep.title.toLowerCase().includes(term) ||
        ep.author.toLowerCase().includes(term) ||
        ep.categories.some(c => c.toLowerCase().includes(term)) ||
        ep.description.toLowerCase().includes(term)
    );
    renderGrid(results, `Resultados para "${query}"`);
}

// Móvil
window.toggleMobileSearch = function() {
    const el = document.getElementById('mobileSearchBar');
    const overlay = document.getElementById('searchOverlay');
    if (!el || !overlay) return;

    if (el.classList.contains('open')) {
        el.classList.remove('open');
        overlay.classList.remove('active');
        document.getElementById('mobileSearchInput').value = '';
        clearMobileSearchResults();
    } else {
        el.classList.add('open');
        overlay.classList.add('active');
        document.getElementById('mobileSearchInput').focus();
    }
};

window.closeSearch = function() {
    const mobileBar = document.getElementById('mobileSearchBar');
    const overlay = document.getElementById('searchOverlay');
    if (mobileBar) mobileBar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    clearDesktopSearchResults();
    clearMobileSearchResults();
};

window.handleMobileSearchInput = function(query) {
    clearTimeout(searchTimeout);
    if (!query || query.trim() === '') {
        clearMobileSearchResults();
        return;
    }
    searchTimeout = setTimeout(() => {
        const results = performQuickSearch(query);
        renderMobileSearchResults(results, query);
    }, 300);
};

window.handleMobileSearchEnter = function(event) {
    event.preventDefault();
    const query = document.getElementById('mobileSearchInput').value.trim();
    if (query) handleMobileSearch(query);
};

window.handleMobileSearchButton = function() {
    const query = document.getElementById('mobileSearchInput').value.trim();
    if (query) handleMobileSearch(query);
};

function handleMobileSearch(query) {
    performSearch(query);
    window.closeSearch();
}

function renderMobileSearchResults(results, query) {
    const container = document.getElementById('mobileSearchResults');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-gray-400"><p>No encontramos resultados para "${query}"</p></div>`;
        return;
    }

    container.innerHTML = results.map(ep => `
        <div class="search-result-item" onclick="window.goToDetail('${ep.detailUrl}'); window.closeSearch()">
            <div class="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img src="${ep.coverUrl}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm text-white truncate">${ep.title}</h4>
                <p class="text-xs text-gray-400 truncate">${ep.author} • ${ep.type === 'video' ? 'Video' : 'Audio'}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML += `
        <div class="search-result-item mt-2 border-t border-white/10 pt-2" onclick="window.handleMobileSearch('${query}')">
            <div class="flex items-center justify-center w-full">
                <span class="text-blue-400 font-bold text-sm">Ver todos los resultados para "${query}"</span>
            </div>
        </div>
    `;
}

function clearMobileSearchResults() {
    const container = document.getElementById('mobileSearchResults');
    if (container) container.innerHTML = '';
}

// Scroll header
window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const topHeader = document.getElementById('main-header');
    const mobileSearch = document.getElementById('mobileSearchBar');
    if (!topHeader || !mobileSearch) return;

    if (st > lastScrollTop && st > 100) {
        topHeader.style.opacity = '0';
        topHeader.style.pointerEvents = 'none';
        mobileSearch.style.opacity = '0';
        mobileSearch.style.pointerEvents = 'none';
    } else {
        topHeader.style.opacity = '1';
        topHeader.style.pointerEvents = 'auto';
        mobileSearch.style.opacity = '1';
        mobileSearch.style.pointerEvents = 'auto';
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

// ---------- RENDER FEED ----------
export function renderFeed(container) {
    // Crear estructura de feed si no existe
    let feedView = document.getElementById('feed-view');
    let gridView = document.getElementById('grid-view');
    if (!feedView) {
        container.innerHTML = `
            <div id="feed-view" class="space-y-12 transition-opacity duration-300"></div>
            <div id="grid-view" class="hidden transition-opacity duration-300">
                <div class="flex items-center justify-between mb-8 mt-6">
                    <h2 id="grid-title" class="text-2xl font-bold">Resultados</h2>
                    <button onclick="window.showFeed()" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"></div>
                <div id="empty-state" class="hidden py-10 text-center">
                    <p class="text-gray-400 text-lg mb-8" id="empty-msg">No encontramos nada...</p>
                    <h3 class="text-xl font-bold mb-6 text-white">Quizás te interese esto:</h3>
                    <div id="recommendations-grid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"></div>
                </div>
            </div>
        `;
        feedView = document.getElementById('feed-view');
        gridView = document.getElementById('grid-view');
    }

    renderCategoryPills();

    // Función segura para obtener aleatorios
    const getRandomSafe = (count, filterFn = () => true) => {
        const filtered = DATA.filter(filterFn);
        if (filtered.length === 0) return [];
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    feedView.innerHTML = '';

    feedView.innerHTML += createCarousel("Nuevos Lanzamientos", "standard",
        getRandomSafe(15), "Todos");

    feedView.innerHTML += createCarousel("Series de Video", "expand",
        getRandomSafe(10, e => e.type === 'video'), "Cine y TV");

    feedView.innerHTML += createCarousel("Top Semanal", "list",
        getRandomSafe(16), "Todos");

    feedView.innerHTML += createCarousel("Para Estudiar Profundamente", "double",
        getRandomSafe(20), "Matemáticas");

    feedView.innerHTML += createCarousel("Matemáticas", "standard",
        getRandomSafe(15, e => e.categories.includes("Matemáticas")), "Matemáticas");

    feedView.innerHTML += createCarousel("Especiales en Video", "expand",
        getRandomSafe(10, e => e.type === 'video'), "Documentales");

    feedView.innerHTML += createCarousel("Física y Astronomía", "standard",
        getRandomSafe(15, e => e.categories.includes("Física y Astronomía")), "Física y Astronomía");

    feedView.innerHTML += createCarousel("Ciencias Naturales y Tecnología", "double",
        getRandomSafe(20, e => e.categories.some(c =>
            ["Ciencias Naturales", "Tecnología e Informática"].includes(c))), "Otras Ciencias");

    feedView.innerHTML += createSeriesCarousel();

    feedView.innerHTML += createCarousel("Otras Ciencias y Disciplinas", "standard",
        getRandomSafe(15, e => e.categories.includes("Otras Ciencias") ||
            e.categories.some(c => ["Ciencias Naturales", "Tecnología e Informática"].includes(c))),
        "Otras Ciencias");
}

// ---------- RENDER EPISODIO ----------
export function renderEpisodio(container, id) {
    const ep = getEpisodioById(id);
    if (!ep) {
        import('./404.js').then(module => module.render(container));
        return;
    }

    const html = `
        <div class="podcast-widget max-w-5xl mx-auto">
            <div class="podcast-header relative rounded-[40px] overflow-hidden mb-8">
                <div class="podcast-header-bg absolute inset-0 bg-cover bg-center filter blur-2xl brightness-70 scale-110" style="background-image: url('${ep.coverUrl}');"></div>
                <div class="relative z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 min-h-[300px] flex items-end">
                    <div class="flex items-end gap-8">
                        <img src="${ep.coverUrl}" class="w-40 h-40 rounded-[32px] object-cover shadow-2xl" alt="cover">
                        <div>
                            <h1 class="text-4xl font-extrabold">${ep.title}</h1>
                            <p class="text-lg text-gray-300 mt-2">${ep.author}</p>
                            <p class="text-gray-400 mt-3 max-w-2xl">${ep.description}</p>
                        </div>
                    </div>
                </div>
                <div class="relative z-10 flex justify-between items-center px-8 pb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
                            <img src="${ep.coverUrl}" class="w-full h-full object-cover">
                        </div>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition" onclick="window.handleAdd(event, '${ep.id}')">
                            <img src="${userStorage.playlist.has(ep.id) ? ICONS.added : ICONS.add}" class="w-6 h-6 filter invert">
                        </button>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition" onclick="window.handleDl(event, '${ep.id}')">
                            <img src="${ep.allowDownload ? ICONS.dl : ICONS.noDl}" class="w-6 h-6 filter invert">
                        </button>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition" onclick="navigator.share({title:'${ep.title}', url: window.location.href})">
                            <img src="https://marca1.odoo.com/web/image/511-3d2d2e2c/compartir.svg" class="w-6 h-6 filter invert">
                        </button>
                    </div>
                    <button class="podcast-last-episode-btn bg-[#7b2eda] hover:bg-[#8f3ef0] rounded-[40px] px-8 py-2 flex items-center gap-4 transition transform hover:scale-105" onclick="window.handlePlay(event, '${ep.id}')">
                        <span class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                            <img src="${ICONS.play}" class="w-6 h-6 filter invert ml-1">
                        </span>
                        <span class="text-left">
                            <span class="text-xs text-white/90 block">REPRODUCIR</span>
                            <span class="text-lg font-bold block">${ep.title.substring(0, 20)}...</span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Parte del programa (serie) -->
            ${ep.series ? `
            <div class="part-of-program mt-8 p-8 bg-white/5 backdrop-blur rounded-3xl border border-white/10">
                <h3 class="text-2xl font-bold mb-6">Parte del programa</h3>
                <div class="program-card flex items-center gap-8 cursor-pointer" onclick="window.goToDetail('${ep.series.url_serie}')">
                    <img src="${ep.series.portada_serie}" class="w-24 h-24 rounded-2xl object-cover">
                    <div>
                        <h3 class="text-2xl font-bold">${ep.series.titulo_serie}</h3>
                        <p class="text-gray-400 mt-1">${ep.series.descripcion_serie}</p>
                        <p class="text-[#7b2eda] font-semibold mt-2">Ver más episodios →</p>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;
}

// ---------- RENDER SERIE ----------
export function renderSerie(container, serieUrl) {
    const serie = getSerieByUrl(serieUrl);
    if (!serie) {
        import('./404.js').then(module => module.render(container));
        return;
    }

    const episodiosSerie = getEpisodiosBySerieUrl(serieUrl);
    // Ordenar por fecha descendente
    episodiosSerie.sort((a, b) => new Date(b.date) - new Date(a.date));

    const episodiosHtml = episodiosSerie.map(ep => `
        <div class="episode-card flex items-center gap-6 p-6 bg-white/5 backdrop-blur rounded-3xl border border-white/10 mb-4">
            <img src="${ep.coverUrl}" class="w-24 h-24 rounded-2xl object-cover">
            <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold truncate">${ep.title}</h3>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-gray-400">${ep.author}</span>
                    <span class="bg-[#7b2eda]/30 px-2 py-0.5 rounded-full text-xs">${ep.type === 'video' ? 'VIDEO' : 'PODCAST'}</span>
                </div>
                <p class="text-gray-400 text-sm mt-2 line-clamp-2">${ep.description}</p>
                <div class="flex items-center gap-3 mt-4">
                    <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20" onclick="window.handleAdd(event, '${ep.id}')">
                        <img src="${userStorage.playlist.has(ep.id) ? ICONS.added : ICONS.add}" class="w-5 h-5 filter invert">
                    </button>
                    <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20" onclick="window.handleDl(event, '${ep.id}')">
                        <img src="${ep.allowDownload ? ICONS.dl : ICONS.noDl}" class="w-5 h-5 filter invert">
                    </button>
                    <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20" onclick="navigator.share({title:'${ep.title}', url: window.location.origin + '/episodio/' + ep.id})">
                        <img src="https://marca1.odoo.com/web/image/511-3d2d2e2c/compartir.svg" class="w-5 h-5 filter invert">
                    </button>
                </div>
            </div>
            <button class="episode-play-btn w-14 h-14 rounded-full bg-[#7b2eda] flex items-center justify-center hover:scale-110 transition" onclick="window.handlePlay(event, '${ep.id}')">
                <img src="${ICONS.play}" class="w-7 h-7 filter invert ml-1">
            </button>
        </div>
    `).join('');

    const ultimoEpisodio = episodiosSerie[0] || null;

    const html = `
        <div class="podcast-widget max-w-5xl mx-auto">
            <div class="podcast-header relative rounded-[40px] overflow-hidden mb-8">
                <div class="podcast-header-bg absolute inset-0 bg-cover bg-center filter blur-2xl brightness-70 scale-110" style="background-image: url('${serie.portada_serie}');"></div>
                <div class="relative z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 min-h-[300px] flex items-end">
                    <div class="flex items-end gap-8">
                        <img src="${serie.portada_serie}" class="w-40 h-40 rounded-[32px] object-cover shadow-2xl" alt="cover serie">
                        <div>
                            <h1 class="text-4xl font-extrabold">${serie.titulo_serie}</h1>
                            <p class="text-lg text-gray-300 mt-2">${episodiosSerie[0]?.author || ''}</p>
                            <p class="text-gray-400 mt-3 max-w-2xl">${serie.descripcion_serie}</p>
                        </div>
                    </div>
                </div>
                <div class="relative z-10 flex justify-between items-center px-8 pb-8">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
                            <img src="${serie.portada_serie}" class="w-full h-full object-cover">
                        </div>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition">
                            <img src="${ICONS.add}" class="w-6 h-6 filter invert">
                        </button>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition">
                            <img src="${ICONS.dl}" class="w-6 h-6 filter invert">
                        </button>
                        <button class="podcast-icon-btn w-12 h-12 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/30 transition">
                            <img src="https://marca1.odoo.com/web/image/511-3d2d2e2c/compartir.svg" class="w-6 h-6 filter invert">
                        </button>
                    </div>
                    ${ultimoEpisodio ? `
                    <button class="podcast-last-episode-btn bg-[#7b2eda] hover:bg-[#8f3ef0] rounded-[40px] px-8 py-2 flex items-center gap-4 transition transform hover:scale-105" onclick="window.handlePlay(event, '${ultimoEpisodio.id}')">
                        <span class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                            <img src="${ICONS.play}" class="w-6 h-6 filter invert ml-1">
                        </span>
                        <span class="text-left">
                            <span class="text-xs text-white/90 block">ÚLTIMO EPISODIO</span>
                            <span class="text-lg font-bold block">${ultimoEpisodio.title.substring(0, 20)}...</span>
                        </span>
                    </button>
                    ` : ''}
                </div>
            </div>

            <!-- Lista de episodios -->
            <div class="podcast-episodes-list mt-8">
                ${episodiosHtml}
            </div>
        </div>
    `;

    container.innerHTML = html;
}
