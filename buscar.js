// buscar.js
export function render(container) {
    container.innerHTML = `
        <div class="max-w-5xl mx-auto py-8">
            <h1 class="text-4xl font-bold mb-8">Buscar</h1>
            <div class="flex gap-4">
                <input type="text" id="searchPageInput" placeholder="Escribe tu búsqueda..." class="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="searchPageBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition">Buscar</button>
            </div>
            <div id="searchPageResults" class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
        </div>
    `;

    const input = document.getElementById('searchPageInput');
    const btn = document.getElementById('searchPageBtn');
    const resultsDiv = document.getElementById('searchPageResults');

    function performSearch() {
        const query = input.value.trim();
        if (!query) return;

        // Importar episodios y filtrar (simulado)
        import('./episodios.js').then(({ episodios }) => {
            const term = query.toLowerCase();
            const filtered = episodios.filter(ep =>
                ep.title.toLowerCase().includes(term) ||
                ep.author.toLowerCase().includes(term) ||
                ep.description.toLowerCase().includes(term)
            );

            if (filtered.length === 0) {
                resultsDiv.innerHTML = '<p class="text-gray-400 col-span-full">No se encontraron resultados.</p>';
                return;
            }

            resultsDiv.innerHTML = filtered.map(ep => `
                <div class="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition" onclick="window.goToDetail('${ep.detailUrl}')">
                    <img src="${ep.coverUrl}" class="w-full aspect-square object-cover rounded-lg mb-3">
                    <h3 class="font-bold text-white truncate">${ep.title}</h3>
                    <p class="text-sm text-gray-400 truncate">${ep.author}</p>
                </div>
            `).join('');
        });
    }

    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
}

export const header = true;
