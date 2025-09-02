# Changelog

## Unreleased

### Added
- Apertura automatica degli strumenti sviluppatore quando l'app gira in modalita' `dev` per facilitare il debug della console locale.
- Logger del processo main con output colorato, timestamp e instradamento dei messaggi provenienti dal renderer.

### Changed
- Aggiornata la Content Security Policy per consentire solo in sviluppo gli script inline richiesti da Vite/React e i canali WebSocket locali, mantenendo la configurazione rigida in produzione.
- Soppressi i messaggi di errore Autofill generati automaticamente dai DevTools per mantenere pulita la console di avvio.

### Tests
- Estesi i test della finestra principale per verificare l'apertura/chiusura degli strumenti sviluppatore in base alla modalita'.
- Aggiunti test sulla generazione della Content Security Policy per coprire gli scenari sviluppo/produzione.
- Coperti i nuovi percorsi di log e il filtro dei messaggi console dal renderer.
