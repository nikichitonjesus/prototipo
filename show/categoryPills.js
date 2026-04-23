// show/categoryPills.js - Píldoras de categorías
import { CATEGORIES } from './constants.js';

export function renderCategoryPills(activeCat = 'Todos') {
    const container = document.getElementById('category-pills');
    if (!container) return;

    container.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const isActive = cat === activeCat;
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;
        btn.innerText = cat;
        btn.addEventListener('click', () => window.handleCategoryClick(cat));
        container.appendChild(btn);
    });
}
