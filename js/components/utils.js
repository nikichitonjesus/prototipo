// utils.js - Funciones auxiliares y DATA global
import { getEpisodiosConSerie } from './lib/episodios.js';

export function determineCategories(ep) {
    const cats = new Set();
    const text = (ep.title + ' ' + ep.description + ' ' + (ep.series?.titulo_serie || '') + ' ' + (ep.series?.descripcion_serie || '')).toLowerCase();
    const patterns = {
        "Derecho": /\b(derecho|penal|civil|constitucional|procesal|delito|ley|jurisprudencia|código|tribunal|justicia|proceso|abogado|legal)\b/i,
        "Física y Astronomía": /\b(física|fisica|mecánica|mecanica|cuántica|cuantica|termodinámica|termodinamica|newton|einstein|astronomía|astronomia|planeta|cosmos|gravedad|universo)\b/i,
        "Matemáticas": /\b(matemática|matematicas|calculo|cálculo|algebra|álgebra|geometria|geometría|estadistica|estadística|probabilidad|ecuacion|ecuación|teorema|integral|función|funcion)\b/i,
        "Historia": /\b(historia|histórico|historico|siglo|época|epoca|imperio|guerra|revolución|revolucion|antiguo|medieval|edad media|antigüedad)\b/i,
        "Filosofía": /\b(filosofía|filosofia|kant|platon|platón|aristoteles|ética|etica|metafísica|metafisica|ontología|ontologia|epistemología|epistemologia|pensamiento|razón|razon)\b/i,
        "Economía y Finanzas": /\b(economía|economia|finanzas|inflación|inflacion|keynes|oferta|demanda|macroeconomía|macroeconomia|pib|mercado|dinero|banco|inversión|inversion|geopolítica|geopolitica|política|politica)\b/i,
        "Ciencias Sociales": /\b(sociología|sociologia|antropología|antropologia|psicología|psicologia|sociedad|cultura|identidad|género|genero|desigualdad|comunidad|social|humano)\b/i,
        "Arte y Cultura": /\b(arte|pintura|escultura|arquitectura|renacimiento|barroco|música|musica|cultura|artístico|artistico|artista|obra)\b/i,
        "Literatura y Audiolibros": /\b(audiolibro|libro|novela|cuento|poema|clásico|clasico|literatura|lectura|escritor|poesía|poesia)\b/i,
        "Cine y TV": /\b(cine|película|pelicula|serie|director|guion|ficción|ficcion|animación|animacion|actor|actriz|documental)\b/i,
        "Documentales": /\b(documental|bbc|naturaleza|espacio|universo|planeta|national geographic|descubrimiento|exploración|exploracion)\b/i,
        "Ciencias Naturales": /\b(biología|biologia|química|quimica|geología|geologia|ecología|ecologia|evolución|evolucion|genética|genetica|clima|botánica|botanica|animal|planta|ecosistema)\b/i,
        "Tecnología e Informática": /\b(tecnología|tecnologia|programación|programacion|python|ia|computación|computacion|algoritmo|software|desarrollo|hardware|informática|informatica)\b/i,
        "Investigación y Criminología": /\b(investigación|investigacion|criminalística|criminalistica|crimen|delito|forense|guerra|conflicto|violencia|seguridad|policía|policia|detective|asesinato|homicidio)\b/i
    };
    for (const [cat, regex] of Object.entries(patterns)) {
        if (regex.test(text)) cats.add(cat);
    }
    if (ep.type === 'video') {
        if (text.includes('documental')) cats.add("Documentales");
        else cats.add("Cine y TV");
    }
    if (cats.size === 0) cats.add("Otras Ciencias");
    return Array.from(cats);
}

export const DATA = getEpisodiosConSerie().map(ep => ({
    ...ep,
    categories: determineCategories(ep)
}));

export function getRandomSafe(count, filterFn = () => true) {
    const filtered = DATA.filter(filterFn);
    if (filtered.length === 0) return [];
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, filtered.length));
}

export function showCustomAlert(title, message) {
    const fullMessage = `"${title}" ${message}`;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-zinc-900 rounded-2xl p-6 max-w-md w-[90%] border border-zinc-700 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-4">${fullMessage}</h3>
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
                <a href="https://www.baltaanay.org/error" target="_blank" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium text-center transition">Reportar</a>
                <a href="https://www.baltaanay.org/contactus" target="_blank" class="px-5 py-2.5 btn-primary rounded-lg text-white font-medium text-center transition">Solicitar</a>
                <button onclick="this.closest('.fixed').remove()" class="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white font-medium transition">Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
