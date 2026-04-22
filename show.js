// show.js - Punto de entrada para compatibilidad con main.js
// Re-exporta todas las funciones y variables que antes estaban aquí

export { DATA } from './js/components/utils.js';
export { renderFeed } from './js/components/feed.js';
export { renderGrid, renderSeriesGrid, showItemsGrid, showSeriesGrid } from './js/components/grid.js';
export { renderEpisodio, renderSerie } from './js/components/detail.js';
export { renderCategoryPills } from './js/components/categoryPills.js';

// También exportamos las funciones que main.js podría necesitar (aunque no las use directamente)
export { ICONS, CATEGORIES } from './js/components/constants.js';
export { determineCategories, getRandomSafe, showCustomAlert } from './js/components/utils.js';
export { createStandardCard, createVerticalCard, createVideoExpand, createListItem, createGridCard } from './js/components/cards.js';
export { createCarousel, createSeriesCarousel, createRecommendedCarousel } from './js/components/carousel.js';

// Las funciones globales ya se asignaron a window en grid.js, pero por si acaso se exportan
export { shareContent, handlePlay, handleDl, handleAdd, goToDetail, handleCategoryClick } from './js/components/grid.js';
