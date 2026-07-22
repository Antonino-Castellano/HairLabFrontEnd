import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  ColorAnalysis,
  ColorPalette
} from '../../../../models/color-analysis';

import {
  getProfileEnumLabel
} from '../../../../models/enums/profile-enum-labels';

import {
  ColorAnalysisService
} from '../../../../service/color-analysis-service';

/**
 * Mostra l'analisi cromatica e armocromatica
 * associata a una cliente.
 */
@Component({
  selector: 'app-color-analysis-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './color-analysis-detail.html',
  styleUrl: './color-analysis-detail.css'
})
export class ColorAnalysisDetailComponent
    implements OnChanges {

  private readonly colorAnalysisService =
    inject(ColorAnalysisService);

  /**
   * ID della cliente ricevuto
   * dal componente CustomerDetail.
   */
  @Input({
    required: true
  })
  customerId!: number;

  /**
   * Analisi caricata dal backend.
   */
  protected readonly colorAnalysis =
    signal<ColorAnalysis | null>(null);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  /**
   * Indica che per la cliente
   * non esiste ancora un'analisi cromatica.
   */
  protected readonly analysisNotFound =
    signal(false);

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId
    ) {

      this.loadColorAnalysis();
    }
  }

  /**
   * Recupera l'analisi tramite customerId.
   */
  protected loadColorAnalysis(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.analysisNotFound.set(false);

    this.colorAnalysisService
      .getByCustomerId(
        this.customerId
      )
      .subscribe({

        next: analysis => {

          this.colorAnalysis.set(
            analysis
          );

          this.loading.set(false);
        },

        error: error => {

          this.loading.set(false);

          this.colorAnalysis.set(
            null
          );

          /**
           * Il backend attuale può restituire
           * 400 oppure 404 quando l'analisi
           * non è ancora presente.
           */
          if (
            error.status === 400 ||
            error.status === 404
          ) {

            this.analysisNotFound.set(
              true
            );

            return;
          }

          this.errorMessage.set(
            'Impossibile caricare l’analisi cromatica.'
          );
        }
      });
  }

  /**
   * Traduzione generica degli Enum.
   */
  protected label(
    value:
      string |
      null |
      undefined
  ): string {

    return getProfileEnumLabel(
      value
    );
  }

  /**
   * Traduzione specifica del valore cromatico.
   *
   * Evitiamo di usare la traduzione generica
   * di LIGHT perché nel contesto SkinTone
   * significa "Chiara", mentre qui significa
   * "Chiaro".
   */
  protected colorValueLabel(
    value:
      string |
      null |
      undefined
  ): string {

    switch (value) {

      case 'LIGHT':
        return 'Chiaro';

      case 'MEDIUM':
        return 'Medio';

      case 'DEEP':
        return 'Profondo';

      default:
        return 'Non specificato';
    }
  }

  /**
   * Trasforma:
   *
   * {
   *   "Borgogna": "#6D213C"
   * }
   *
   * in un array utilizzabile nel template.
   */
  protected paletteEntries(
    palette:
      ColorPalette |
      null |
      undefined
  ): [string, string][] {

    if (!palette) {
      return [];
    }

    return Object.entries(
      palette
    );
  }
}