/**
 * Esegue il deep merge di più oggetti sorgente in un oggetto target.
 * Funzione simile a Object.assign() ma che supporta il merge profondo di oggetti annidati.
 */
export function deepMerge<T extends object = object>(...objects: Partial<T>[]): T {
  const target = {} as T;

  // Per ciascun oggetto da unire
  for (const source of objects) {
    if (!source) {
      continue;
    }

    // Per ciascuna proprietà nell'oggetto
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Se entrambi sono oggetti e non array, merge ricorsivo
        if (
          sourceValue && 
          typeof sourceValue === 'object' && 
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' && 
          !Array.isArray(targetValue)
        ) {
          target[key] = deepMerge(targetValue, sourceValue);
        } else {
          // Altrimenti, sovrascrive o aggiunge la proprietà
          target[key] = sourceValue as any;
        }
      }
    }
  }

  return target;
}
