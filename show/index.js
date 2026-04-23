// show/index.js - Punto de entrada del módulo show
// Re-exporta todo lo que el antiguo show.js exponía

export { DATA } from './utils.js';
export { renderFeed } from './feed.js';
export { renderEpisodio, renderSerie } from './detail.js';
export { renderGrid, renderSeriesGrid, showItemsGrid, showSeriesGrid } from './grid.js';
export { renderCategoryPills } from './categoryPills.js';

// También exportamos utilidades por si acaso
export { ICONS, CATEGORIES } from './constants.js';
export { determineCategories, getRandomSafe, showCustomAlert } from './utils.js';
export { createStandardCard, createVerticalCard, createVideoExpand, createListItem, createGridCard } from './cards.js';
export { createCarousel, createSeriesCarousel, createRecommendedCarousel } from './carousel.js';

// Las funciones globales ya se asignaron a window en grid.js, pero las re-exportamos
export { shareContent, handlePlay, handleDl, handleAdd, goToDetail, handleCategoryClick } from './grid.js';
import { initGlobalClickHandler } from './events.js';
initGlobalClickHandler();
