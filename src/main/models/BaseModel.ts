import { Model } from 'sequelize-typescript';

/**
 * Classe base per tutti i modelli dell'applicazione
 * Estende il Model di sequelize-typescript
 */
export class BaseModel<T extends object = any> extends Model<T> {
  // Metodi comuni che possono essere utilizzati da tutti i modelli
  public toJSON(): object {
    // Esclude proprietà private/sensibili e restituisce un oggetto pulito
    const values = Object.assign({}, this.get());
    
    // Qui possono essere aggiunte logiche di trasformazione comuni a tutti i modelli
    
    return values;
  }
}
