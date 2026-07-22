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
  SKIN_TONE_VISUALS,
  getVisualReference
} from '../../../../models/enums/profile-visual-references';

import type {
  ProfileVisualReference
} from '../../../../models/enums/profile-visual-references';

import {
  ColorAnalysisService
} from '../../../../service/color-analysis-service';

/**
 * Visualizza l'analisi cromatica
 * della cliente.
 *
 * Mostra:
 *
 * - pelle;
 * - reference cromatica reale;
 * - sottotono;
 * - stagione;
 * - sottostagione;
 * - valore;
 * - contrasto;
 * - croma;
 * - palette;
 * - metalli;
 * - note.
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

  @Input({
    required: true
  })
  customerId!: number;

  protected readonly colorAnalysis =
    signal<ColorAnalysis | null>(
      null
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly analysisNotFound =
    signal(false);

  protected readonly skinToneVisuals =
    SKIN_TONE_VISUALS;

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId > 0
    ) {

      this.loadColorAnalysis();
    }
  }

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

  protected visual(
    collection:
      Record<
        string,
        ProfileVisualReference
      >,
    value:
      string |
      null |
      undefined
  ): ProfileVisualReference {

    return getVisualReference(
      collection,
      value
    );
  }

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

  /**
   * Reference pelle visualizzata.
   *
   * Priorità:
   *
   * 1. valore personalizzato;
   * 2. colore associato a SkinTone;
   * 3. fallback.
   */
  protected getSkinReferenceColor(
    analysis: ColorAnalysis
  ): string {

    if (
      analysis.skinReferenceColor
    ) {

      return analysis
        .skinReferenceColor;
    }

    if (
      analysis.skinTone
    ) {

      return (
        this.visual(
          this.skinToneVisuals,
          analysis.skinTone
        ).color ??
        '#BC7D5E'
      );
    }

    return '#BC7D5E';
  }
}