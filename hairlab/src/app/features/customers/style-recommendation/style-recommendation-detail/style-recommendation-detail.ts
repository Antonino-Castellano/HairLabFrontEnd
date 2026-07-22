import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import {
  RecommendationItem
} from '../../../../models/recommendation-item';

import {
  StyleRecommendation
} from '../../../../models/style-recommendation';

import {
  StyleRecommendationService
} from '../../../../service/style-recommendation-service';

/**
 * Visualizza i suggerimenti professionali
 * generati dinamicamente da HairLab.
 *
 * Il componente NON salva dati.
 *
 * Ogni volta che viene caricato richiama il backend,
 * che genera nuovamente i suggerimenti utilizzando:
 *
 * - HairProfile;
 * - FaceProfile;
 * - ColorAnalysis.
 */
@Component({
  selector: 'app-style-recommendation-detail',
  standalone: true,
  imports: [],
  templateUrl: './style-recommendation-detail.html',
  styleUrl: './style-recommendation-detail.css'
})
export class StyleRecommendationDetailComponent
    implements OnChanges {

  /**
   * Service che comunica con
   * StyleRecommendationController.
   */
  private readonly styleRecommendationService =
    inject(StyleRecommendationService);

  /**
   * Cliente per cui generare
   * i suggerimenti.
   */
  @Input({
    required: true
  })
  customerId!: number;

  /**
   * Risultato ricevuto dal backend.
   */
  protected readonly recommendations =
    signal<StyleRecommendation | null>(null);

  /**
   * Stato di caricamento.
   */
  protected readonly loading =
    signal(false);

  /**
   * Eventuale errore.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Quando cambia customerId
   * rigeneriamo automaticamente
   * i suggerimenti.
   */
  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId
    ) {

      this.loadRecommendations();
    }
  }

  /**
   * Richiede al backend la generazione
   * aggiornata dei suggerimenti.
   *
   * Può essere richiamato anche manualmente
   * dal pulsante "Rigenera suggerimenti".
   */
  protected loadRecommendations(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.styleRecommendationService
      .getByCustomerId(
        this.customerId
      )
      .subscribe({

        next: result => {

          this.recommendations.set(
            result
          );

          this.loading.set(false);
        },

        error: () => {

          this.recommendations.set(
            null
          );

          this.loading.set(false);

          this.errorMessage.set(
            'Impossibile generare i suggerimenti HairLab.'
          );
        }
      });
  }

  /**
   * Limita il punteggio nel range 0-100.
   *
   * Serve per la barra grafica
   * della compatibilità.
   */
  protected scoreWidth(
    score:
      number |
      null |
      undefined
  ): string {

    const safeScore =
      Math.max(
        0,
        Math.min(
          100,
          score ?? 0
        )
      );

    return `${safeScore}%`;
  }

  /**
   * Restituisce una descrizione testuale
   * della compatibilità.
   *
   * IMPORTANTE:
   *
   * non parliamo di "accuratezza",
   * perché il punteggio rappresenta solamente
   * la compatibilità con le regole HairLab.
   */
  protected scoreLabel(
    score:
      number |
      null |
      undefined
  ): string {

    const value =
      score ?? 0;

    if (value >= 90) {
      return 'Compatibilità molto alta';
    }

    if (value >= 75) {
      return 'Compatibilità alta';
    }

    if (value >= 60) {
      return 'Compatibilità buona';
    }

    if (value >= 40) {
      return 'Compatibilità moderata';
    }

    return 'Da valutare';
  }

  /**
   * Restituisce true se almeno uno
   * dei quattro gruppi contiene suggerimenti.
   */
  protected hasRecommendations(
    data: StyleRecommendation
  ): boolean {

    return (
      data.haircutRecommendations.length > 0 ||
      data.fringeRecommendations.length > 0 ||
      data.colorRecommendations.length > 0 ||
      data.stylingRecommendations.length > 0
    );
  }

  /**
   * Identifica il suggerimento con
   * compatibilità maggiore di una lista.
   *
   * Lo utilizzeremo per evidenziare
   * visivamente la prima scelta HairLab.
   */
  protected isTopRecommendation(
    item: RecommendationItem,
    items: RecommendationItem[]
  ): boolean {

    if (items.length === 0) {
      return false;
    }

    const highestScore =
      Math.max(
        ...items.map(
          recommendation =>
            recommendation.compatibilityScore
        )
      );

    return (
      item.compatibilityScore ===
      highestScore
    );
  }
}