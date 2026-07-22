import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  ColorAnalysis,
  ColorPalette
} from '../../../../models/color-analysis';

import {
  Chroma,
  ColorSeason,
  ColorSubSeason,
  ColorValue,
  ContrastLevel,
  MetalType,
  SkinTone,
  Undertone
} from '../../../../models/enums/color-analysis-enums';

import {
  getProfileEnumLabel
} from '../../../../models/enums/profile-enum-labels';

import {
  ColorAnalysisService
} from '../../../../service/color-analysis-service';

/**
 * Elemento visuale della palette.
 */
interface PaletteEntry {
  name: string;
  hex: string;
}

/**
 * Form utilizzato per creare o modificare
 * l'analisi cromatica di una cliente.
 */
@Component({
  selector: 'app-color-analysis-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './color-analysis-form.html',
  styleUrl: './color-analysis-form.css'
})
export class ColorAnalysisFormComponent
    implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly colorAnalysisService =
    inject(ColorAnalysisService);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected customerId?: number;

  protected analysisId?: number;

  protected readonly isEditMode =
    signal(false);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  /**
   * Stagione attualmente selezionata.
   *
   * Serve per mostrare solamente
   * le 3 sottostagioni compatibili.
   */
  protected readonly selectedSeason =
    signal<ColorSeason | null>(null);

  /**
   * Palette gestite separatamente
   * dal FormGroup perché sono strutture
   * dinamiche nome -> HEX.
   */
  protected readonly bestColors =
    signal<PaletteEntry[]>([]);

  protected readonly avoidColors =
    signal<PaletteEntry[]>([]);

  /**
   * Metalli selezionati.
   */
  protected readonly selectedMetals =
    signal<MetalType[]>([]);

  /*
   * ============================================================
   * ENUM DISPONIBILI
   * ============================================================
   */

  protected readonly skinTones =
    Object.values(SkinTone);

  protected readonly undertones =
    Object.values(Undertone);

  protected readonly seasons =
    Object.values(ColorSeason);

  protected readonly colorValues =
    Object.values(ColorValue);

  protected readonly contrastLevels =
    Object.values(ContrastLevel);

  protected readonly chromaValues =
    Object.values(Chroma);

  protected readonly metals =
    Object.values(MetalType);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  protected readonly analysisForm =
    this.formBuilder.group({

      skinTone:
        this.formBuilder.control<
          SkinTone | null
        >(null),

      undertone:
        this.formBuilder.control<
          Undertone | null
        >(null),

      season:
        this.formBuilder.control<
          ColorSeason | null
        >(
          null,
          Validators.required
        ),

      subSeason:
        this.formBuilder.control<
          ColorSubSeason | null
        >(
          null,
          Validators.required
        ),

      colorValue:
        this.formBuilder.control<
          ColorValue | null
        >(null),

      contrastLevel:
        this.formBuilder.control<
          ContrastLevel | null
        >(null),

      chroma:
        this.formBuilder.control<
          Chroma | null
        >(null),

      notes:
        this.formBuilder.control<string>(
          ''
        ),

      /*
       * Campi temporanei utilizzati
       * per aggiungere colori.
       */
      bestColorName:
        this.formBuilder.control<string>(
          ''
        ),

      bestColorHex:
        this.formBuilder.control<string>(
          '#6D213C'
        ),

      avoidColorName:
        this.formBuilder.control<string>(
          ''
        ),

      avoidColorHex:
        this.formBuilder.control<string>(
          '#D4A017'
        )
    });

  ngOnInit(): void {

    const customerIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('customerId');

    const analysisIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('analysisId');

    if (!customerIdParam) {

      this.errorMessage.set(
        'ID cliente mancante.'
      );

      return;
    }

    const customerId =
      Number(customerIdParam);

    if (
      Number.isNaN(customerId) ||
      customerId <= 0
    ) {

      this.errorMessage.set(
        'ID cliente non valido.'
      );

      return;
    }

    this.customerId =
      customerId;

    /*
     * Se analysisId è presente
     * siamo in modalità modifica.
     */
    if (analysisIdParam) {

      const analysisId =
        Number(analysisIdParam);

      if (
        Number.isNaN(analysisId) ||
        analysisId <= 0
      ) {

        this.errorMessage.set(
          'ID analisi non valido.'
        );

        return;
      }

      this.analysisId =
        analysisId;

      this.isEditMode.set(
        true
      );

      this.loadAnalysis(
        analysisId
      );
    }
  }

  /**
   * Carica l'analisi esistente
   * in modalità modifica.
   */
  private loadAnalysis(
    analysisId: number
  ): void {

    this.loading.set(true);

    this.colorAnalysisService
      .getById(
        analysisId
      )
      .subscribe({

        next: analysis => {

          this.selectedSeason.set(
            analysis.season ?? null
          );

          this.analysisForm.patchValue({

            skinTone:
              analysis.skinTone ?? null,

            undertone:
              analysis.undertone ?? null,

            season:
              analysis.season ?? null,

            subSeason:
              analysis.subSeason ?? null,

            colorValue:
              analysis.colorValue ?? null,

            contrastLevel:
              analysis.contrastLevel ?? null,

            chroma:
              analysis.chroma ?? null,

            notes:
              analysis.notes ?? ''
          });

          this.bestColors.set(
            this.paletteToEntries(
              analysis.bestColors
            )
          );

          this.avoidColors.set(
            this.paletteToEntries(
              analysis.avoidColors
            )
          );

          this.selectedMetals.set(
            [
              ...(analysis.bestMetals ?? [])
            ]
          );

          this.loading.set(false);
        },

        error: () => {

          this.errorMessage.set(
            'Impossibile caricare l’analisi cromatica.'
          );

          this.loading.set(false);
        }
      });
  }

  /**
   * Seleziona la macro stagione.
   *
   * Quando cambia stagione azzeriamo
   * una eventuale sottostagione incompatibile.
   */
  protected selectSeason(
    season: ColorSeason
  ): void {

    this.selectedSeason.set(
      season
    );

    this.analysisForm.controls
      .season
      .setValue(
        season
      );

    const currentSubSeason =
      this.analysisForm.controls
        .subSeason
        .value;

    if (
      currentSubSeason &&
      !this.availableSubSeasons()
        .includes(currentSubSeason)
    ) {

      this.analysisForm.controls
        .subSeason
        .setValue(null);
    }
  }

  /**
   * Restituisce solamente le 3 sottostagioni
   * compatibili con la stagione selezionata.
   */
  protected availableSubSeasons():
    ColorSubSeason[] {

    switch (
      this.selectedSeason()
    ) {

      case ColorSeason.SPRING:

        return [
          ColorSubSeason.LIGHT_SPRING,
          ColorSubSeason.WARM_SPRING,
          ColorSubSeason.BRIGHT_SPRING
        ];

      case ColorSeason.SUMMER:

        return [
          ColorSubSeason.LIGHT_SUMMER,
          ColorSubSeason.COOL_SUMMER,
          ColorSubSeason.SOFT_SUMMER
        ];

      case ColorSeason.AUTUMN:

        return [
          ColorSubSeason.SOFT_AUTUMN,
          ColorSubSeason.WARM_AUTUMN,
          ColorSubSeason.DEEP_AUTUMN
        ];

      case ColorSeason.WINTER:

        return [
          ColorSubSeason.BRIGHT_WINTER,
          ColorSubSeason.COOL_WINTER,
          ColorSubSeason.DEEP_WINTER
        ];

      default:

        return [];
    }
  }

  /**
   * Aggiunge un colore alla palette consigliata.
   */
  protected addBestColor(): void {

    const name =
      this.analysisForm.controls
        .bestColorName
        .value
        ?.trim();

    const hex =
      this.analysisForm.controls
        .bestColorHex
        .value
        ?.trim();

    if (
      !name ||
      !this.isValidHex(hex)
    ) {

      this.errorMessage.set(
        'Inserisci un nome e un colore HEX valido.'
      );

      return;
    }

    this.bestColors.update(
      colors =>
        this.addOrReplaceColor(
          colors,
          name,
          hex!
        )
    );

    this.analysisForm.patchValue({
      bestColorName: ''
    });

    this.errorMessage.set('');
  }

  /**
   * Aggiunge un colore alla palette
   * meno armonica.
   */
  protected addAvoidColor(): void {

    const name =
      this.analysisForm.controls
        .avoidColorName
        .value
        ?.trim();

    const hex =
      this.analysisForm.controls
        .avoidColorHex
        .value
        ?.trim();

    if (
      !name ||
      !this.isValidHex(hex)
    ) {

      this.errorMessage.set(
        'Inserisci un nome e un colore HEX valido.'
      );

      return;
    }

    this.avoidColors.update(
      colors =>
        this.addOrReplaceColor(
          colors,
          name,
          hex!
        )
    );

    this.analysisForm.patchValue({
      avoidColorName: ''
    });

    this.errorMessage.set('');
  }

  /**
   * Rimuove un colore consigliato.
   */
  protected removeBestColor(
    index: number
  ): void {

    this.bestColors.update(
      colors =>
        colors.filter(
          (_, currentIndex) =>
            currentIndex !== index
        )
    );
  }

  /**
   * Rimuove un colore da evitare.
   */
  protected removeAvoidColor(
    index: number
  ): void {

    this.avoidColors.update(
      colors =>
        colors.filter(
          (_, currentIndex) =>
            currentIndex !== index
        )
    );
  }

  /**
   * Seleziona/deseleziona un metallo.
   */
  protected toggleMetal(
    metal: MetalType
  ): void {

    this.selectedMetals.update(
      metals => {

        if (
          metals.includes(metal)
        ) {

          return metals.filter(
            value =>
              value !== metal
          );
        }

        return [
          ...metals,
          metal
        ];
      }
    );
  }

  /**
   * Verifica se un metallo
   * è attualmente selezionato.
   */
  protected isMetalSelected(
    metal: MetalType
  ): boolean {

    return this.selectedMetals()
      .includes(
        metal
      );
  }

  /**
   * Salvataggio.
   */
  protected submit(): void {

    if (
      this.analysisForm.invalid ||
      !this.customerId
    ) {

      this.analysisForm
        .markAllAsTouched();

      this.errorMessage.set(
        'Seleziona almeno stagione e sottostagione.'
      );

      return;
    }

    this.loading.set(true);

    this.errorMessage.set('');

    const value =
      this.analysisForm
        .getRawValue();

    const analysis:
      ColorAnalysis = {

        customerId:
          this.customerId,

        skinTone:
          value.skinTone,

        undertone:
          value.undertone,

        season:
          value.season,

        subSeason:
          value.subSeason,

        colorValue:
          value.colorValue,

        contrastLevel:
          value.contrastLevel,

        chroma:
          value.chroma,

        bestColors:
          this.entriesToPalette(
            this.bestColors()
          ),

        avoidColors:
          this.entriesToPalette(
            this.avoidColors()
          ),

        bestMetals:
          this.selectedMetals(),

        notes:
          value.notes
      };

    /*
     * MODIFICA.
     */
    if (
      this.isEditMode() &&
      this.analysisId
    ) {

      this.colorAnalysisService
        .update(
          this.analysisId,
          analysis
        )
        .subscribe({

          next: () =>
            this.navigateToCustomer(),

          error: error =>
            this.handleError(error)
        });

      return;
    }

    /*
     * CREAZIONE.
     */
    this.colorAnalysisService
      .insert(
        analysis
      )
      .subscribe({

        next: () =>
          this.navigateToCustomer(),

        error: error =>
          this.handleError(error)
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

  /**
   * Etichetta contestuale del valore cromatico.
   */
  protected colorValueLabel(
    value: ColorValue
  ): string {

    switch (value) {

      case ColorValue.LIGHT:
        return 'Chiaro';

      case ColorValue.MEDIUM:
        return 'Medio';

      case ColorValue.DEEP:
        return 'Profondo';
    }
  }

  private navigateToCustomer(): void {

    this.router.navigate([
      '/customers',
      this.customerId
    ]);
  }

  /**
   * Converte Record in array.
   */
  private paletteToEntries(
    palette:
      ColorPalette |
      null |
      undefined
  ): PaletteEntry[] {

    if (!palette) {
      return [];
    }

    return Object.entries(
      palette
    ).map(
      ([name, hex]) => ({
        name,
        hex
      })
    );
  }

  /**
   * Converte array in:
   *
   * {
   *   nome: "#HEX"
   * }
   */
  private entriesToPalette(
    entries: PaletteEntry[]
  ): ColorPalette {

    const palette:
      ColorPalette = {};

    for (
      const entry of entries
    ) {

      palette[
        entry.name
      ] = entry.hex;
    }

    return palette;
  }

  /**
   * Se esiste già un colore con lo stesso nome,
   * lo sostituiamo invece di duplicarlo.
   */
  private addOrReplaceColor(
    colors: PaletteEntry[],
    name: string,
    hex: string
  ): PaletteEntry[] {

    const filtered =
      colors.filter(
        color =>
          color.name.toLowerCase() !==
          name.toLowerCase()
      );

    return [
      ...filtered,
      {
        name,
        hex: hex.toUpperCase()
      }
    ];
  }

  /**
   * Validazione HEX.
   */
  private isValidHex(
    value:
      string |
      null |
      undefined
  ): boolean {

    if (!value) {
      return false;
    }

    return /^#[0-9A-Fa-f]{6}$/
      .test(
        value
      );
  }

  private handleError(
    error: HttpErrorResponse
  ): void {

    this.loading.set(false);

    if (
      error.error &&
      typeof error.error === 'object'
    ) {

      const message =
        Object.values(
          error.error
        ).find(
          value =>
            typeof value === 'string'
        );

      if (
        typeof message === 'string'
      ) {

        this.errorMessage.set(
          message
        );

        return;
      }
    }

    this.errorMessage.set(
      'Impossibile salvare l’analisi cromatica.'
    );
  }
}