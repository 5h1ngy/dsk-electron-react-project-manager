# Changelog

## Unreleased

### Added
- Apertura automatica degli strumenti sviluppatore quando l'app gira in modalita' `dev` per facilitare il debug della console locale.
- Logger del processo main con output colorato, timestamp e instradamento dei messaggi provenienti dal renderer.
- Dominio autenticazione: modelli Sequelize tipizzati (User, Role, UserRole, AuditLog), migrazione Argon2id con seed admin e gestione sessioni locali sicure.
- IPC `auth:*`, preload API e UI React (login RHF + gestione utenti AntD) completamente offline.

### Changed
- Aggiornata la Content Security Policy per consentire solo in sviluppo gli script inline richiesti da Vite/React e i canali WebSocket locali, mantenendo la configurazione rigida in produzione.
- Soppressi i messaggi di errore Autofill generati automaticamente dai DevTools per mantenere pulita la console di avvio.
- Registrazione centralizzata dei canali IPC con logging standardizzato e chiusura DevTools opzionale in produzione.

### Tests
- Estesi i test della finestra principale per verificare l'apertura/chiusura degli strumenti sviluppatore in base alla modalita'.
- Aggiunti test sulla generazione della Content Security Policy per coprire gli scenari sviluppo/produzione.
- Coperti i nuovi percorsi di log e il filtro dei messaggi console dal renderer.
- Suite Jest per auth domain (hash Argon2, session manager, AuthService, IPC, preload, store Zustand) con coverage >80%/70% nel monorepo.
