// show.js
import { episodiosConSlug, getEpisodioBySlug, getSerieBySlug, getEpisodiosBySerieSlug } from './episodios.js';

export function renderFeed(container) {
    container.innerHTML = '<h2>Feed de episodios</h2>';
    const carrusel = document.createElement('div');
    carrusel.className = 'carrusel';
    episodiosConSlug.forEach(ep => {
        const item = document.createElement('div');
        item.className = 'carrusel-item';
        item.innerHTML = `
            <img src="${ep.coverUrl}" alt="${ep.title}" style="width:100%">
            <h3><a href="/episodio/${ep.slug}" data-link>${ep.title}</a></h3>
            <p>${ep.description.substring(0, 50)}...</p>
        `;
        carrusel.appendChild(item);
    });
    container.appendChild(carrusel);
}

export function renderEpisodio(container, slug) {
    const episodio = getEpisodioBySlug(slug);
    if (!episodio) {
        import('./404.js').then(module => module.render(container));
        return;
    }
    container.innerHTML = `
        <h2>${episodio.title}</h2>
        <img src="${episodio.coverUrl}" alt="${episodio.title}" style="max-width:300px">
        <p>${episodio.description}</p>
        <p>Autor: ${episodio.author}</p>
        <p>Fecha: ${episodio.date}</p>
        ${episodio.type === 'audio' ? `<audio controls src="${episodio.mediaUrl}"></audio>` : ''}
        ${episodio.type === 'video' ? `<video controls src="${episodio.mediaUrl}" style="max-width:100%"></video>` : ''}
        <p><a href="/serie/${episodio.series.url_serie.slice(1)}" data-link>Ver serie: ${episodio.series.titulo_serie}</a></p>
    `;
}

export function renderSerie(container, slug) {
    const serie = getSerieBySlug(slug);
    if (!serie) {
        import('./404.js').then(module => module.render(container));
        return;
    }
    const episodios = getEpisodiosBySerieSlug(slug);
    container.innerHTML = `
        <h2>${serie.titulo_serie}</h2>
        <img src="${serie.portada_serie}" alt="${serie.titulo_serie}" style="max-width:300px">
        <p>${serie.descripcion_serie}</p>
        <h3>Episodios</h3>
    `;
    const lista = document.createElement('div');
    episodios.forEach(ep => {
        const epDiv = document.createElement('div');
        epDiv.className = 'episodio-card';
        epDiv.innerHTML = `
            <h4><a href="/episodio/${ep.slug}" data-link>${ep.title}</a></h4>
            <p>${ep.description}</p>
        `;
        lista.appendChild(epDiv);
    });
    container.appendChild(lista);
}
