# Struttura “5 pezzi” (copiabile)

1. **Obiettivo chiaro** – cosa vuoi ottenere.
2. **Contesto minimo utile** – linguaggio, framework, file/funzione coinvolti, input/output.
3. **Vincoli** – performance, compatibilità, stile, versioni, dipendenze.
4. **Formato dell’output** – firma funzione, snippet completo, solo patch, checklist, ecc.
5. **Esempio/Test** (facoltativo ma potentissimo) – casi d’uso, dati di esempio, test attesi.

---

## Template veloci (incollali come commento sopra al codice o in chat)

### 1) Genera una funzione

```text
OBIETTIVO: implementare una funzione che {fa X}.
CONTESTO: {linguaggio}, {versione}, librerie disponibili {…}. Input {…}, output {…}.
VINCOLI: O(n log n), evitare mutazioni globali, nessuna dipendenza extra.
OUTPUT: solo il codice della funzione con docstring + esempi d’uso.
TEST DI ACCETTAZIONE:
- input: … → output: …
- input: … → output: …
```

### 2) Refactor

```text
OBIETTIVO: rendi più leggibile/manutenibile questo blocco senza cambiare comportamento.
CONTESTO: {file/path}, {framework}, target {versione}.
VINCOLI: mantieni le firme pubbliche; copertura test invariata; no nuove lib.
OUTPUT: diff unificato (patch) + breve spiegazione (≤5 righe).
```

### 3) Fix di un bug

```text
OBIETTIVO: correggere il bug “{descrizione}”.
CONTESTO: stack {…}, funzione {…}, input problematico {…}.
VINCOLI: non rompere i casi esistenti; aggiungi 1 test che riproduce il bug.
OUTPUT: patch + il nuovo test unitario che passa.
```

### 4) Genera test unitari

```text
OBIETTIVO: creare test per {modulo/funzione}.
CONTESTO: framework test {pytest/jest/junit}, versioni {…}.
VINCOLI: copri casi normali, edge e errori; niente I/O reale (usa mock).
OUTPUT: file di test completo e autonomo.
```

### 5) Documentazione/README

```text
OBIETTIVO: documentare l’uso di {modulo}.
CONTESTO: pubblico {interno/esterno}, livello {base/intermedio}.
VINCOLI: esempi eseguibili; sezioni: Scopo, Installazione, API, Esempi, Limitazioni.
OUTPUT: Markdown pronto per README.md.
```

### 6) Review del codice

```text
OBIETTIVO: code review focalizzata.
CONTESTO: standard di stile {…}, performance sensibile.
VINCOLI: evidenzia solo problemi ad alto impatto.
OUTPUT: elenco puntato: (1) rischio (2) perché (3) fix proposto (snippet).
```

---

## Come usarli bene in VS Code

* **Incolla il prompt come commento** subito sopra alla funzione o al blocco selezionato (l’AI “vede” il contesto).
* **Seleziona il codice rilevante** prima di chiedere refactor/fix: riduce verbosità e allucinazioni.
* **Chiedi un formato preciso** (“dammi una patch diff”, “solo la funzione”, “solo i test”).
* **Dai 1–2 esempi di I/O** invece di spiegazioni lunghe: la qualità sale subito.
* **Itera con micro-prompt**: “accorcia i nomi”, “aggiungi handling per timeout”, “rendi thread-safe”.

---

## Mini-prompt pronti all’uso (one-liner)

* “Scrivi una funzione Python che fa parsing di {formato} in O(n) con esempi di input/output.”
* “Refactor di questo metodo per ridurre complessità ciclomatica a <10, nessun cambiamento di comportamento.”
* “Spiega perché questo test fallisce e proponi una patch minima.”
* “Genera test Jest con copertura >90% per {file}, includendo edge cases.”
* “Produci un README conciso con esempi eseguibili per questa libreria.”

---

## Checklist rapida (Do/Don’t)

**Do**

* Specifica linguaggio, versione e framework.
* Definisci input/output attesi.
* Imposta vincoli chiari (performance, dipendenze, stile).
* Richiedi formato d’output (funzione, patch, file, markdown).
* Fornisci un paio di casi test.

**Don’t**

* Prompt generici tipo “ottimizza questo” senza obiettivo.
* Incollare l’intero repo: seleziona solo ciò che serve.
* Accettare risposte senza test/esempi.
* Dimenticare le versioni (Node 20 ≠ 14, Python 3.12 ≠ 3.8).

---

## Esempio completo (JS, fix + test)

```text
OBIETTIVO: correggere l’arrotondamento errato in roundTo(n, step).
CONTESTO: Node 20, Jest, file src/math.ts. Input: float n, step > 0. Output: numero arrotondato al multiplo più vicino di step.
VINCOLI: niente dipendenze; mantieni export; gestisci NaN e step=0 con errore.
OUTPUT: patch diff + test Jest.
TEST DI ACCETTAZIONE:
- roundTo(1.24, 0.1) → 1.2
- roundTo(1.25, 0.1) → 1.3
- roundTo(-1.25, 0.1) → -1.3
```