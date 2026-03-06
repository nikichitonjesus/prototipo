// episodios.js
export const episodios = [
    {
        date: '2025-11-28',
        type: 'audio',
        mediaUrl: 'https://d3ctxlq1ktw2nl.cloudfront.net/staging/2025-10-29/413399242-44100-2-2f259e66aeac3.m4a',
        coverUrl: 'https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/staging/podcast_uploaded_nologo400/44500417/44500417-1759018829686-8b0dde55850ed.jpg',
        title: 'La excepción en el proceso de administración de Justicia',
        description: 'La excepción en el proceso de administración de Justicia',
        detailUrl: '/teoria-del-proceso', // ¿serie?
        allowDownload: false,
        author: "Barahona",
        series: {
            portada_serie: 'https://media.baltaanay.org/web/image/658-redirect/960bc627aab97e6134955b4d5d1c99d0.jpg',
            titulo_serie: 'Teoría del proceso',
            descripcion_serie: 'Proceso en el derecho y la forma de poner en movimiento la maquinaria de Justicia',
            url_serie: '/teoria-del-proceso'
        }
    },
    {
        date: '2025-11-28',
        type: 'audio',
        mediaUrl: 'https://balta-derecho.odoo.com/documents/content/3L5vYn32Sq-M5sUKB96S1Ao9',
        coverUrl: 'https://s3-us-west-2.amazonaws.com/anchor-generated-image-bank/staging/podcast_uploaded_nologo400/44500417/44500417-1759018829686-8b0dde55850ed.jpg',
        title: 'Principios procesales',
        description: 'La excepción en el proceso de administración de Justicia',
        detailUrl: '/teoria-del-proceso',
        allowDownload: false,
        author: "Barahona",
        series: {
            portada_serie: 'https://media.baltaanay.org/web/image/658-redirect/960bc627aab97e6134955b4d5d1c99d0.jpg',
            titulo_serie: 'Teoría del proceso',
            descripcion_serie: 'Proceso en el derecho y la forma de poner en movimiento la maquinaria de Justicia',
            url_serie: '/teoria-del-proceso'
        }
    },
    {
        date: '2025-11-01',
        type: 'video',
        mediaUrl: 'https://lb.s3.odysee.tv/vods2.odysee.live/odysee-replays/84515919a2e010fa2c381702a6777c1035c2deb3/1762812470.mp4',
        coverUrl: 'https://balta.odoo.com/web/image/417-e2fd48e0/media.webp',
        title: 'Responsabilidad penal en la adolecencia',
        description: 'Conferencia de Derechos Humanos. Sobre la responsabilidad penal de la adolecencia, las penas y las medidas de seguridad.',
        detailUrl: '/ddhh/adolecencia', // podría ser episodio individual
        allowDownload: false,
        author: "Rony Eulalio",
        series: {
            portada_serie: 'https://scout.es/wp-content/uploads/2021/12/186-01.jpg',
            titulo_serie: 'Derechos Humanos',
            descripcion_serie: 'Derechos Humanos',
            url_serie: '/ddhh'
        }
    }
];

// Función para generar slug a partir de título (simple)
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Agregar slugs a los episodios
export const episodiosConSlug = episodios.map(ep => ({
    ...ep,
    slug: slugify(ep.title)
}));

// Obtener episodio por slug
export function getEpisodioBySlug(slug) {
    return episodiosConSlug.find(ep => ep.slug === slug);
}

// Obtener serie por slug (de la url_serie, quitando la barra inicial)
export function getSerieBySlug(slug) {
    // Las series son únicas? Podría haber varias con misma url_serie. Tomamos la primera.
    const serie = episodiosConSlug.find(ep => ep.series.url_serie === '/' + slug);
    return serie ? serie.series : null;
}

// Obtener episodios de una serie (por slug de serie)
export function getEpisodiosBySerieSlug(slug) {
    return episodiosConSlug.filter(ep => ep.series.url_serie === '/' + slug);
}
