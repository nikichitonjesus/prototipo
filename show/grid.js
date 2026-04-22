// show/grid.js - Cuadrículas, búsquedas y funciones globales (play, add, dl, share)
import { DATA, showCustomAlert } from './utils.js';
import { ICONS } from './constants.js';
import { userStorage } from '../storage.js';
import { createGridCard } from './cards.js';
import { getAllEpisodios } from '../lib/episodios.js';

export function renderGrid(container, items, title) {
    let gridView = document.getElementById('grid-view');
    if (!gridView) {
        container.innerHTML = `
            <div id="feed-view" class="hidden"></div>
            <div id="grid-view" class="transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">${title}</h2>
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
        gridView = document.getElementById('grid-view');
    }

    const gridContainer = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const titleEl = document.getElementById('grid-title');
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

    document.getElementById('feed-view')?.classList.add('hidden');
    gridView.classList.remove('hidden');

    document.getElementById('closeGridBtn')?.addEventListener('click', () => {
        window.history.pushState(null, null, '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}

export function renderSeriesGrid(container, title) {
    const seriesSet = new Map();
    DATA.forEach(ep => {
        if (ep.series && !seriesSet.has(ep.series.url_serie)) {
            seriesSet.set(ep.series.url_serie, ep.series);
        }
    });

    const series = Array.from(seriesSet.values());

    let gridView = document.getElementById('grid-view');
    if (!gridView) {
        container.innerHTML = `
            <div id="feed-view" class="hidden"></div>
            <div id="grid-view" class="transition-opacity duration-300">
                <div class="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-6">
                    <h2 id="grid-title" class="text-xl sm:text-2xl font-bold">${title}</h2>
                    <button id="closeGridBtn" class="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                        <span class="text-xl">×</span> Cerrar búsqueda
                    </button>
                </div>
                <div id="results-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"></div>
                <div id="empty-state" class="hidden py-8 sm:py-10 text-center">
                    <p class="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8" id="empty-msg">No encontramos series...</p>
                </div>
            </div>
        `;
        gridView = document.getElementById('grid-view');
    }

    const gridContainer = document.getElementById('results-grid');
    const emptyState = document.getElementById('empty-state');
    const titleEl = document.getElementById('grid-title');
    titleEl.innerText = title;
    gridContainer.innerHTML = '';

    if (series.length === 0) {
        emptyState.classList.remove('hidden');
        gridContainer.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        series.forEach(serie => {
            gridContainer.innerHTML += `
                <div class="grid-card group cursor-pointer" onclick="window.goToDetail('${serie.url_serie}')">
                    <div class="aspect-square bg-zinc-800/50 relative rounded-xl overflow-hidden">
                        <img src="${serie.portada_serie}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                    </div>
                    <h4 class="font-bold text-sm text-white truncate mt-2 group-hover:text-blue-400 transition-colors">${serie.titulo_serie}</h4>
                    <p class="text-xs text-gray-500 truncate">Serie</p>
                </div>
            `;
        });
    }

    document.getElementById('feed-view')?.classList.add('hidden');
    gridView.classList.remove('hidden');

    document.getElementById('closeGridBtn')?.addEventListener('click', () => {
        window.history.pushState(null, null, '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
}

// ---------- FUNCIONES GLOBALES (window) ----------
export function shareContent(title, url, cover = '', description = '') {
    const fullUrl = window.location.origin + url;
    const shareData = {
        title,
        text: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        url: fullUrl
    };

    const updateMeta = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', cover || 'https://balta-media.odoo.com/default-og-image.jpg');
    updateMeta('og:url', fullUrl);

    if (navigator.share) {
        navigator.share(shareData).catch(() => navigator.clipboard.writeText(fullUrl));
    } else {
        navigator.clipboard.writeText(fullUrl);
    }
}

export function handlePlay(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep) return;

    window.playEpisodeExpanded(
        ep.mediaUrl || '',
        ep.mediaVideo || '',
        ep.initialMode || 'audio',
        ep.coverUrl || '',
        ep.coverInfo || ep.coverUrl || '',
        ep.title || '',
        ep.detailUrl || '',
        ep.author || '',
        getAllEpisodios(),
        ep.text || ep.description || '',
        ep.subtitlesUrl || '',
        ep.bgColor || '#0a0a0a',
        ep.allowDownload ?? false
    );
}

export function handleDl(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep || !ep.allowDownload) return;

    const link = ep.mediaVideo || ep.mediaUrl;
    if (!link) return;

    const a = document.createElement('a');
    a.href = link;
    a.download = `${ep.title.replace(/[^a-z0-9]/gi, '_')}.${ep.mediaVideo ? 'mp4' : 'm4a'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function handleAdd(e, episodioId) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const ep = DATA.find(x => x.id === episodioId);
    if (!ep) return;

    const alreadyIn = userStorage.playlist.has(ep.id);
    if (alreadyIn) {
        userStorage.playlist.remove(ep.id);
    } else {
        userStorage.playlist.add(ep);
    }

    document.querySelectorAll(`[data-episodio-id="${episodioId}"] img[data-added], [data-episodio-id="${episodioId}"] .action-icon[data-added]`)
        .forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = alreadyIn ? ICONS.add : ICONS.added;
                img.dataset.added = alreadyIn ? 'false' : 'true';
                img.style.transform = 'scale(1.3)';
                setTimeout(() => img.style.transform = 'scale(1)', 180);
            }
        });
}

export function goToDetail(url) {
    if (url && url !== '#') {
        window.history.pushState(null, null, url);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

export function handleCategoryClick(category) {
    const url = category === 'Todos' ? '/' : `/categoria/${encodeURIComponent(category)}`;
    window.history.pushState(null, null, url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showItemsGrid(title, itemIds) {
    const items = itemIds.map(id => DATA.find(ep => ep.id === id)).filter(ep => ep);
    const container = document.getElementById('app');
    if (container) renderGrid(container, items, title);
}

export function showSeriesGrid(title) {
    const container = document.getElementById('app');
    if (container) renderSeriesGrid(container, title);
}

// Asignar a window para que estén disponibles globalmente (necesario para onclick en HTML)
window.shareContent = shareContent;
window.handlePlay = handlePlay;
window.handleDl = handleDl;
window.handleAdd = handleAdd;
window.goToDetail = goToDetail;
window.handleCategoryClick = handleCategoryClick;
window.showItemsGrid = showItemsGrid;
window.showSeriesGrid = showSeriesGrid;
