// carousel.js - Carruseles y agrupaciones
import { createStandardCard, createVerticalCard, createVideoExpand, createListItem, createGridCard } from './js/components/cards.js';
import { DATA, getRandomSafe } from './js/components/utils.js';
import { ICONS } from './js/components/constants.js';

function createCarousel(title, type, items, categoryContext, viewAllType = 'category') {
    if (!items || items.length === 0) return '';
    const id = 'c-' + Math.random().toString(36).substr(2, 9);
    let content = '';
    let extraClass = '';

    if (type === 'double') {
        extraClass = 'carousel-double';
        content = `<div id="${id}" class="flex flex-col flex-wrap h-[580px] gap-x-6 gap-y-3 overflow-x-auto no-scrollbar scroll-smooth">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    } else if (type === 'list') {
        content = `<div id="${id}" class="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;
        for (let i = 0; i < items.length; i += 4) {
            content += `<div class="card-list-group min-w-[300px] sm:min-w-[340px] space-y-3">` +
                (items[i] ? createListItem(items[i], i) : '') +
                (items[i+1] ? createListItem(items[i+1], i+1) : '') +
                (items[i+2] ? createListItem(items[i+2], i+2) : '') +
                (items[i+3] ? createListItem(items[i+3], i+3) : '') +
                `</div>`;
        }
        content += `</div>`;
    } else if (type === 'expand') {
        content = `<div id="${id}" class="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createVideoExpand(ep)).join('') +
            `</div>`;
    } else if (type === 'vertical') {
        content = `<div id="${id}" class="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createVerticalCard(ep)).join('') +
            `</div>`;
    } else {
        content = `<div id="${id}" class="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 pl-1">` +
            items.map(ep => createStandardCard(ep)).join('') +
            `</div>`;
    }

    let verTodoHandler;
    if (viewAllType === 'series') {
        verTodoHandler = `window.showSeriesGrid('${title}')`;
    } else if (categoryContext && categoryContext !== 'Todos') {
        verTodoHandler = `window.handleCategoryClick('${categoryContext}')`;
    } else {
        const itemIds = JSON.stringify(items.map(ep => ep.id));
        verTodoHandler = `window.showItemsGrid('${title}', ${itemIds})`;
    }

    return `<section class="carousel-wrapper relative group/section mb-8 sm:mb-12 ${extraClass}">
        <div class="flex items-end justify-between mb-3 sm:mb-5 px-1">
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors cursor-pointer" onclick="${verTodoHandler}">${title}</h2>
            <button onclick="${verTodoHandler}" class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors">Ver todo</button>
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
        if (ep.series) {
            const serieKey = ep.series.url_serie;
            if (!seriesGroups[serieKey]) {
                seriesGroups[serieKey] = { episodes: [], seriesInfo: ep.series };
            }
            seriesGroups[serieKey].episodes.push(ep);
        }
    });

    let seriesArray = Object.entries(seriesGroups).map(([key, value]) => ({ key, ...value }));
    for (let i = seriesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seriesArray[i], seriesArray[j]] = [seriesArray[j], seriesArray[i]];
    }

    if (seriesArray.length === 0) return '';

    let content = `<div id="${id}" class="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-4">`;
    seriesArray.forEach(group => {
        group.episodes.sort((a, b) => new Date(b.date) - new Date(a.date));
        const s = group.seriesInfo;
        if (!s || group.episodes.length < 1) return;
        content += `<div class="card-list-group min-w-[300px] sm:min-w-[340px]">
            <div class="mb-4 cursor-pointer group/serie" onclick="window.goToDetail('${s.url_serie}')">
                <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800/50">
                    <img src="${s.portada_serie}" class="w-full h-full object-cover group-hover/serie:scale-105 transition-transform duration-500" loading="lazy">
                </div>
                <h3 class="font-bold text-white text-sm truncate mt-2 group-hover/serie:text-blue-400 transition-colors">${s.titulo_serie}</h3>
                <p class="text-xs text-gray-400 flex items-center gap-1">
                    <span>ver serie</span>
                    <span class="text-blue-400">→</span>
                </p>
            </div>
            <div class="space-y-3">
                ${group.episodes.slice(0, 4).map((ep, i) => createListItem(ep, i)).join('')}
            </div>
        </div>`;
    });
    content += `</div>`;

    return `<section class="carousel-wrapper relative group/section mb-8 sm:mb-12">
        <div class="flex items-end justify-between mb-3 sm:mb-5 px-1">
            <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors cursor-pointer" onclick="window.showSeriesGrid('Series y Cursos Académicos')">Series y Cursos Académicos</h2>
            <button class="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors" onclick="window.showSeriesGrid('Series y Cursos Académicos')">Ver todo</button>
        </div>
        <div class="relative">
            <div class="nav-btn left" onclick="document.getElementById('${id}').scrollLeft -= 600"><button>❮</button></div>
            ${content}
            <div class="nav-btn right" onclick="document.getElementById('${id}').scrollLeft += 600"><button>❯</button></div>
        </div>
    </section>`;
}

function createRecommendedCarousel(currentEp) {
    if (!currentEp) return '';
    const similar = DATA
        .filter(e => e.id !== currentEp.id && e.categories.some(c => currentEp.categories.includes(c)))
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

    if (similar.length === 0) return '';

    return createCarousel("Te puede interesar", "standard", similar, null, 'items');
}

export { createCarousel, createSeriesCarousel, createRecommendedCarousel };
