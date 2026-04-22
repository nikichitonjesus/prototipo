// show/events.js - Listener global de clics (antes estaba al final del show.js original)
export function initGlobalClickHandler() {
    document.addEventListener('click', function(e) {
        const target = e.target.closest(
            '[data-action], .play-icon-lg, .mobile-play-button, .episode-play-btn, .action-icon'
        );
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const episodioId = target.closest('[data-episodio-id]')?.dataset.episodioId;
        if (!episodioId) return;

        if (target.matches('[data-action="play"], .play-icon-lg, .mobile-play-button, .episode-play-btn')) {
            window.handlePlay(e, episodioId);
        } else if (target.matches('[data-action="dl"]') || target.title?.includes('Descargar')) {
            window.handleDl(e, episodioId);
        } else if (target.matches('[data-action="add"]') || target.matches('.action-icon[data-added]')) {
            window.handleAdd(e, episodioId);
        }
    }, true);
}
