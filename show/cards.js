// show/cards.js - Tarjetas visuales (standard, vertical, expand, list, grid)
import { ICONS } from './constants.js';
import { userStorage } from '../storage.js';

export function createStandardCard(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-std group relative" data-episodio-id="${ep.id}">
        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}" title="${ep.allowDownload ? 'Descargar' : 'No disponible'}">`}
                <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
            </div>
            ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
        </div>
        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer mt-2">
            <h3 class="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
            <p class="text-xs text-gray-400 truncate">${ep.author}</p>
        </div>
    </div>`;
}

export function createVerticalCard(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-std group relative" data-episodio-id="${ep.id}">
        <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer" onclick="window.goToDetail('${ep.detailUrl}')">
            <img src="${ep.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}">`}
                <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
            </div>
            ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
        </div>
        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer mt-2">
            <h3 class="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
            <p class="text-xs text-gray-400 truncate">${ep.author}</p>
        </div>
    </div>`;
}

export function createVideoExpand(ep) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = ep.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = ep.premium === 'true';

    return `<div class="card-video group relative" data-episodio-id="${ep.id}">
        <img src="${ep.coverUrl}" class="absolute inset-0 w-full h-full object-cover z-10 group-hover:opacity-0 transition-opacity duration-300">
        <img src="${ep.coverUrl}" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="overlay-full z-20 ${isPremium ? 'premium-overlay' : ''}">
            ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${ep.id}">`}
            <img src="${addIcon}" class="action-icon" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
            ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${ep.id}">` : ''}
        </div>
        ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg z-30">Premium</div>` : ''}
        <div class="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">VIDEO</div>
    </div>`;
}

export function createListItem(ep, idx) {
    const inPlaylist = userStorage.playlist.has(ep.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const isPremium = ep.premium === 'true';

    return `
        <div class="list-item group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors w-full"
             data-episodio-id="${ep.id}">
            <span class="text-gray-400 font-semibold w-6 text-center text-sm flex-shrink-0">${idx + 1}</span>
            <div class="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                 onclick="window.goToDetail('${ep.detailUrl}')">
                <img src="${ep.coverUrl}" class="w-full h-full object-cover" loading="lazy">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                     data-episodio-id="${ep.id}">
                    ${!isPremium ? `<img src="${ICONS.play}" class="w-5 h-5">` : '<span class="text-white text-xs">Premium</span>'}
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h4 class="text-sm font-medium text-white truncate group-hover:text-blue-400 cursor-pointer"
                        onclick="window.goToDetail('${ep.detailUrl}')">${ep.title}</h4>
                    <span class="text-xs text-gray-400 truncate">${ep.author}</span>
                </div>
            </div>
            <button class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                    data-episodio-id="${ep.id}" data-action="add">
                <img src="${addIcon}" class="w-5 h-5" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
            </button>
        </div>`;
}

export function createGridCard(item) {
    const inPlaylist = userStorage.playlist.has(item.id);
    const addIcon = inPlaylist ? ICONS.added : ICONS.add;
    const dlIcon = item.allowDownload ? ICONS.dl : ICONS.noDl;
    const isPremium = item.premium === 'true';

    return `
        <div class="grid-card group relative" data-episodio-id="${item.id}">
            <div class="aspect-square bg-zinc-800/50 relative rounded-xl overflow-hidden cursor-pointer" onclick="window.goToDetail('${item.detailUrl}')">
                <img src="${item.coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="overlay-full ${isPremium ? 'premium-overlay' : ''}">
                    ${isPremium ? '' : `<img src="${dlIcon}" class="action-icon" data-episodio-id="${item.id}">`}
                    <img src="${addIcon}" class="action-icon" data-episodio-id="${item.id}" data-added="${inPlaylist}">
                    ${!isPremium ? `<img src="${ICONS.play}" class="play-icon-lg" data-episodio-id="${item.id}">` : ''}
                </div>
                ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg">Premium</div>` : ''}
            </div>
            <div onclick="window.goToDetail('${item.detailUrl}')" class="cursor-pointer mt-2">
                <h4 class="font-bold text-sm text-white truncate hover:text-blue-400 transition-colors">${item.title}</h4>
                <p class="text-xs text-gray-500 truncate">${item.author}</p>
            </div>
        </div>
    `;
}
