// show/constants.js - Iconos, categorías y estilos globales
export const ICONS = {
    play: 'https://marca1.odoo.com/web/image/508-f876320c/play.svg',
    pause: 'https://marca1.odoo.com/web/image/508-f876320c/pause.svg',
    add: 'https://marca1.odoo.com/web/image/509-c555b4ef/a%C3%B1adir%20a.svg',
    added: 'https://nikichitonjesus.odoo.com/web/image/1112-d141b3eb/a%C3%B1adido.png',
    dl: 'https://marca1.odoo.com/web/image/510-7a9035c1/descargar.svg',
    noDl: 'https://nikichitonjesus.odoo.com/web/image/1051-622a3db3/no-desc.webp',
    share: 'https://nikichitonjesus.odoo.com/web/image/585-036b7961/cpmartir.png',
    buyPremium: 'https://balta-media.odoo.com/web/image/879-360eccc9/Sotore.webp'
};

export const CATEGORIES = [
    "Todos", "Derecho", "Física y Astronomía", "Matemáticas", "Historia",
    "Filosofía", "Economía y Finanzas", "Ciencias Sociales", "Arte y Cultura",
    "Literatura y Audiolibros", "Cine y TV", "Documentales", "Ciencias Naturales",
    "Tecnología e Informática", "Otras Ciencias"
];

export const GLOBAL_STYLES = `
    <style>
        body {
            background: linear-gradient(135deg, #1a2639 0%, #0f172a 50%, #1e293b 100%);
            min-height: 100vh;
        }
        .bg-custom-dark {
            background: linear-gradient(135deg, #1a2639 0%, #0f172a 50%, #1e293b 100%);
        }
        .card-std, .card-video, .grid-card, .list-item, .detail-view, .serie-header {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(2px);
        }
        .btn-primary {
            background: #0369a1 !important;
        }
        .btn-primary:hover {
            background: #075985 !important;
        }
        .carousel-double .flex-col {
            gap: 0.75rem;
        }
        .carousel-double .card-std {
            margin-bottom: 0;
        }
        .premium-overlay {
            background: rgba(139, 92, 246, 0.3);
        }
    </style>
`;

// Aplicar estilos globales automáticamente
if (!document.getElementById('global-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'global-styles';
    styleSheet.textContent = GLOBAL_STYLES.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(styleSheet);
}
