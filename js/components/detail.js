// detail.js - Vistas de detalle de episodio y serie
import { DATA, showCustomAlert } from './js/components/utils.js';
import { ICONS } from './js/components/constants.js';
import { userStorage } from './storage.js';
import { createRecommendedCarousel } from './js/components/carousel.js';
import { getAllEpisodios } from './lib/episodios.js';

export function renderEpisodio(container, episodioId) {
    try {
        const ep = DATA.find(e => e.id === episodioId);
        if (!ep) {
            import('./404.js').then(m => m.render(container));
            return;
        }
        const inPlaylist = userStorage.playlist.has(ep.id);
        const addIcon = inPlaylist ? ICONS.added : ICONS.add;
        const isPremium = ep.premium === 'true';

        const html = `
            <div class="detail-view w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6" style="background: linear-gradient(135deg, ${ep.bgColor}20 0%, #0a0a0a 100%); min-height: 100vh;">
                <div class="episode-header mb-8">
                    <div class="block lg:hidden">
                        <div class="relative w-full aspect-square max-w-[300px] mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="${ep.coverUrl}" class="w-full h-full object-cover" alt="${ep.title}">
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">${ep.title}</h1>
                        <p class="text-lg text-gray-300 mb-3">${ep.author}</p>
                        <p class="text-gray-400 mb-6 leading-relaxed">${ep.description}</p>
                        <div class="flex items-center gap-3 mb-8">
                            ${isPremium ? `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" onclick="window.location.href='/premium'">
                                    <img src="${ICONS.buyPremium}" class="w-6 h-6">
                                    <span class="font-bold">Comprar Premium</span>
                                </button>
                            ` : `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" data-episodio-id="${ep.id}" data-action="play">
                                    <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                    <span class="font-bold">Reproducir</span>
                                </button>
                            `}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add">
                                <img src="${addIcon}" class="w-6 h-6 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                            </button>
                            ${!isPremium && ep.allowDownload ? `
                                <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl">
                                    <img src="${ICONS.dl}" class="w-6 h-6 icon-white">
                                </button>
                            ` : ''}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')">
                                <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                            </button>
                        </div>
                    </div>
                    <div class="hidden lg:block relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
                        <div class="absolute inset-0 opacity-20">
                            <img src="${ep.coverUrl}" class="w-full h-full object-cover blur-3xl scale-110">
                        </div>
                        <div class="relative z-10 p-8 flex gap-8">
                            <img src="${ep.coverUrl}" class="w-48 h-48 rounded-3xl object-cover shadow-2xl border-2 border-white/20" alt="${ep.title}">
                            <div class="flex-1">
                                <h1 class="text-4xl font-extrabold text-white mb-2">${ep.title}</h1>
                                <p class="text-xl text-gray-300 mb-4">${ep.author}</p>
                                <p class="text-gray-400 max-w-3xl leading-relaxed">${ep.description}</p>
                                <div class="flex items-center gap-4 mt-8">
                                    ${isPremium ? `
                                        <button class="btn-primary flex-1 rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" onclick="window.location.href='/premium'">
                                            <img src="${ICONS.buyPremium}" class="w-6 h-6">
                                            <span class="font-bold text-lg">Comprar Premium</span>
                                        </button>
                                    ` : `
                                        <button class="btn-primary rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" data-episodio-id="${ep.id}" data-action="play">
                                            <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                            <span class="font-bold text-lg">Reproducir</span>
                                        </button>
                                    `}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add" title="Añadir a lista">
                                        <img src="${addIcon}" class="w-6 h-6 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                                    </button>
                                    ${!isPremium && ep.allowDownload ? `
                                        <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl" title="Descargar">
                                            <img src="${ICONS.dl}" class="w-6 h-6 icon-white">
                                        </button>
                                    ` : ''}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')" title="Compartir">
                                        <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ${ep.series ? `
                    <div class="part-of-program mt-8 lg:mt-12 p-6 lg:p-8 bg-white/5 backdrop-blur rounded-3xl border border-white/10">
                        <h3 class="text-xl lg:text-2xl font-bold mb-6">Parte del programa</h3>
                        <div class="program-card flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer group" onclick="window.goToDetail('${ep.series.url_serie}')">
                            <img src="${ep.series.portada_serie}" class="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" alt="${ep.series.titulo_serie}">
                            <div>
                                <h3 class="text-xl lg:text-2xl font-bold group-hover:text-blue-400 transition-colors">${ep.series.titulo_serie}</h3>
                                <p class="text-gray-400 mt-1 line-clamp-2">${ep.series.descripcion_serie}</p>
                                <p class="text-blue-400 font-semibold mt-3 flex items-center gap-1">
                                    Ver más episodios <span class="text-lg">→</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <!-- CARRUSEL RECOMENDADOS -->
                ${createRecommendedCarousel(ep)}
            </div>
        `;
        container.innerHTML = html;
    } catch (error) {
        console.error('Error en renderEpisodio:', error);
        container.innerHTML = `<div class="error-container p-8 text-center">
            <p class="text-red-500 text-lg">Error al cargar el episodio. Intenta de nuevo.</p>
            <button onclick="window.location.href='/'" class="mt-4 btn-primary px-4 py-2 rounded">Volver al inicio</button>
        </div>`;
    }
}

export function renderSerie(container, serieUrl) {
    try {
        const serie = DATA.find(e => e.series?.url_serie === serieUrl)?.series;
        if (!serie) {
            import('./404.js').then(m => m.render(container));
            return;
        }
        const episodiosSerie = DATA.filter(e => e.series?.url_serie === serieUrl);
        episodiosSerie.sort((a, b) => new Date(b.date) - new Date(a.date));
        const episodiosHtml = episodiosSerie.map(ep => {
            const inPlaylist = userStorage.playlist.has(ep.id);
            const addIcon = inPlaylist ? ICONS.added : ICONS.add;
            const isPremium = ep.premium === 'true';

            return `
                <div class="episode-card flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white/5 backdrop-blur rounded-2xl sm:rounded-3xl border border-white/10 mb-4 hover:bg-white/10 transition-all group relative" data-episodio-id="${ep.id}">
                    <img src="${ep.coverUrl}" class="w-full sm:w-24 h-48 sm:h-24 rounded-xl sm:rounded-2xl object-cover" loading="lazy" onclick="window.goToDetail('${ep.detailUrl}')" style="cursor: pointer;">
                    ${isPremium ? `<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-lg z-10">Premium</div>` : ''}
                    <div class="flex-1 min-w-0 w-full">
                        <div onclick="window.goToDetail('${ep.detailUrl}')" class="cursor-pointer">
                            <h3 class="text-lg sm:text-xl font-bold truncate hover:text-blue-400 transition-colors">${ep.title}</h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-gray-400 text-sm">${ep.author}</span>
                                <span class="bg-blue-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-900/30"> ${ep.initialMode === 'video' ? 'VIDEO' : 'AUDIO'} </span>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm mt-2 line-clamp-2 hidden sm:block">${ep.description}</p>
                        <div class="flex items-center gap-2 mt-4">
                            <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="add" title="Añadir a lista">
                                <img src="${addIcon}" class="w-5 h-5 icon-white" data-episodio-id="${ep.id}" data-added="${inPlaylist}">
                            </button>
                            ${!isPremium && ep.allowDownload ? `
                                <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" data-episodio-id="${ep.id}" data-action="dl" title="Descargar">
                                    <img src="${ICONS.dl}" class="w-5 h-5 icon-white">
                                </button>
                            ` : ''}
                            <button class="episode-action-btn w-10 h-10 rounded-xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${ep.title}', '${ep.detailUrl}', '${ep.coverUrl}', '${ep.description}')" title="Compartir">
                                <img src="${ICONS.share}" class="w-5 h-5 icon-white">
                            </button>
                            ${!isPremium ? `
                                <button class="episode-play-btn w-10 h-10 sm:w-14 sm:h-14 rounded-full btn-primary flex items-center justify-center hover:scale-110 transition ml-auto" data-episodio-id="${ep.id}" data-action="play" title="Reproducir">
                                    <img src="${ICONS.play}" class="w-5 h-5 sm:w-7 sm:h-7 icon-white ml-1">
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        const ultimoEpisodio = episodiosSerie[0] || null;
        const html = `
            <div class="detail-view w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6" style="background: linear-gradient(135deg, ${serie.bgColor || '#0a0a0a'}20 0%, #0a0a0a 100%); min-height: 100vh;">
                <div class="serie-header mb-8">
                    <div class="block lg:hidden">
                        <div class="relative w-full aspect-square max-w-[300px] mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="${serie.portada_serie}" class="w-full h-full object-cover" alt="${serie.titulo_serie}">
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">${serie.titulo_serie}</h1>
                        <p class="text-lg text-gray-300 mb-3">${episodiosSerie[0]?.author || ''}</p>
                        <p class="text-gray-400 mb-6 leading-relaxed">${serie.descripcion_serie}</p>
                        <div class="flex items-center gap-3 mb-8">
                            ${ultimoEpisodio && ultimoEpisodio.premium !== 'true' ? `
                                <button class="flex-1 btn-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]" data-episodio-id="${ultimoEpisodio.id}" data-action="play">
                                    <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                    <span class="font-bold">Último episodio</span>
                                </button>
                            ` : ''}
                            <button class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${serie.titulo_serie}', '${serie.url_serie}', '${serie.portada_serie}', '${serie.descripcion_serie}')" title="Compartir serie">
                                <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                            </button>
                        </div>
                    </div>
                    <div class="hidden lg:block relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
                        <div class="absolute inset-0 opacity-20">
                            <img src="${serie.portada_serie}" class="w-full h-full object-cover blur-3xl scale-110">
                        </div>
                        <div class="relative z-10 p-8 flex gap-8">
                            <img src="${serie.portada_serie}" class="w-48 h-48 rounded-3xl object-cover shadow-2xl border-2 border-white/20" alt="${serie.titulo_serie}">
                            <div class="flex-1">
                                <h1 class="text-4xl font-extrabold text-white mb-2">${serie.titulo_serie}</h1>
                                <p class="text-xl text-gray-300 mb-4">${episodiosSerie[0]?.author || ''}</p>
                                <p class="text-gray-400 max-w-3xl leading-relaxed">${serie.descripcion_serie}</p>
                                <div class="flex items-center gap-4 mt-8">
                                    ${ultimoEpisodio && ultimoEpisodio.premium !== 'true' ? `
                                        <button class="btn-primary rounded-2xl py-4 px-8 flex items-center gap-3 transition transform hover:scale-105" data-episodio-id="${ultimoEpisodio.id}" data-action="play">
                                            <img src="${ICONS.play}" class="w-6 h-6 icon-white">
                                            <span class="font-bold text-lg">Último episodio</span>
                                        </button>
                                    ` : ''}
                                    <button class="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition" onclick="window.shareContent('${serie.titulo_serie}', '${serie.url_serie}', '${serie.portada_serie}', '${serie.descripcion_serie}')" title="Compartir serie">
                                        <img src="${ICONS.share}" class="w-6 h-6 icon-white">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="episodes-list mt-8 lg:mt-12">
                    <h2 class="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>Episodios</span>
                        <span class="text-sm font-normal text-gray-500">(${episodiosSerie.length})</span>
                    </h2>
                    <div class="space-y-4">
                        ${episodiosHtml}
                    </div>
                </div>
                <!-- CARRUSEL RECOMENDADOS AL FINAL DE LA SERIE -->
                ${createRecommendedCarousel(episodiosSerie[0])}
            </div>
        `;
        container.innerHTML = html;
    } catch (error) {
        console.error('Error en renderSerie:', error);
        container.innerHTML = `<div class="error-container p-8 text-center">
            <p class="text-red-500 text-lg">Error al cargar la serie. Intenta de nuevo.</p>
            <button onclick="window.location.href='/'" class="mt-4 btn-primary px-4 py-2 rounded">Volver al inicio</button>
        </div>`;
    }
}
