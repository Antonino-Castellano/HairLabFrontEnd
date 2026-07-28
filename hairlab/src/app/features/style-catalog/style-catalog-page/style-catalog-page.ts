import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth-service';
import { HAIRLAB_SERVER_BASE_URL } from '../../../core/config/api.config';
import {
  BeardCatalogFilters,
  BeardStyleDefinitionCatalog,
  CatalogTab,
  FringeCatalogFilters,
  FringeDefinitionCatalog,
  HaircutCatalogFilters,
  HaircutDefinitionCatalog,
  StyleCatalogItem,
  StyleCatalogSummary,
} from '../../../models/style-catalog';
import { StyleCatalogService } from '../../../service/style-catalog-service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog.service';
import {
  hairLabCatalogName,
  hairLabTechnicalLabel,
  hairLabTechnicalText,
} from '../../../shared/ui/hairlab-technical-labels';
import { ToastService } from '../../../shared/ui/toast.service';

type MultiValueField =
  | 'compatibleFaceShapes'
  | 'compatibleHairTypes'
  | 'compatibleDensities'
  | 'compatibleCurrentLengths'
  | 'compatibleForeheadLevels'
  | 'compatibleGrowthPatterns';

interface CatalogFormModel {
  id?: number;
  code: string;
  name: string;
  active: boolean;
  technicalDescription: string;
  futureSimulationDescriptor: string;
  futureSimulationReady: boolean;
  referenceImageUrl: string | null;

  gender: 'FEMALE' | 'MALE';
  family: string;
  lengthCategory: string;
  silhouette: string;
  layerStructure: string;
  perimeterShape: string;
  defaultFringeType: string;
  napeShape: string;
  fadeType: string;
  earExposure: string;
  undercutPresent: boolean;
  asymmetrical: boolean;
  disconnected: boolean;
  faceFramingPresent: boolean;
  crownLengthMinMm: number | null;
  crownLengthMaxMm: number | null;
  fringeLengthMinMm: number | null;
  fringeLengthMaxMm: number | null;
  sideLengthMinMm: number | null;
  sideLengthMaxMm: number | null;
  napeLengthMinMm: number | null;
  napeLengthMaxMm: number | null;

  fringeType: string;
  centerLengthMinMm: number | null;
  centerLengthMaxMm: number | null;

  style: string;
  suggestedLength: string;
  minLengthMm: number | null;
  maxLengthMm: number | null;
  moustacheStyle: string;
  moustacheConnection: string;
  cheekLine: string;
  neckline: string;

  compatibleFaceShapes: string[];
  compatibleForeheadLevels: string[];
  compatibleHairTypes: string[];
  compatibleDensities: string[];
  compatibleCurrentLengths: string[];
  compatibleGrowthPatterns: string[];
}

@Component({
  selector: 'app-style-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './style-catalog-page.html',
  styleUrl: './style-catalog-page.css',
})
export class StyleCatalogPageComponent implements OnInit {
  private readonly styleCatalogService = inject(StyleCatalogService);
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly activeTab = signal<CatalogTab>('haircuts');
  protected readonly summary = signal<StyleCatalogSummary | null>(null);
  protected readonly haircuts = signal<HaircutDefinitionCatalog[]>([]);
  protected readonly fringes = signal<FringeDefinitionCatalog[]>([]);
  protected readonly beards = signal<BeardStyleDefinitionCatalog[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showFilters = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly editing = signal(false);
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly removeCurrentImage = signal(false);

  protected readonly customerId =
    Number(this.route.snapshot.queryParamMap.get('customerId')) || null;
  protected readonly canManage = this.authService.isAdmin();

  protected formModel: CatalogFormModel = this.newForm('haircuts');

  protected haircutFilters: HaircutCatalogFilters = {
    gender: 'FEMALE',
    query: '',
    family: '',
    lengthCategory: '',
    hairType: '',
    faceShape: '',
    density: '',
    undercutPresent: '',
    fadeType: '',
    fringeType: '',
    includeInactive: this.canManage,
  };

  protected fringeFilters: FringeCatalogFilters = {
    gender: 'FEMALE',
    query: '',
    fringeType: '',
    faceShape: '',
    hairType: '',
    density: '',
    includeInactive: this.canManage,
  };

  protected beardFilters: BeardCatalogFilters = {
    query: '',
    style: '',
    length: '',
    faceShape: '',
    density: '',
    growthPattern: '',
    includeInactive: this.canManage,
  };

  protected readonly genders = ['FEMALE', 'MALE'];
  protected readonly haircutFamilies = [
    'BUZZ_CROP',
    'PIXIE',
    'BIXIE',
    'BOB',
    'LOB',
    'SHAG',
    'WOLF_CUT',
    'MULLET',
    'MEDIUM',
    'LONG',
    'CURLY_NATURAL',
    'CLASSIC_MENS',
    'MODERN_MENS',
    'LONG_MENS',
  ];
  protected readonly lengthCategories = [
    'BUZZED',
    'VERY_SHORT',
    'SHORT',
    'MEDIUM',
    'LONG',
    'VERY_LONG',
  ];
  protected readonly silhouettes = [
    'COMPACT',
    'SOFT_ROUNDED',
    'ROUNDED',
    'OVAL',
    'BALANCED',
    'VERTICAL',
    'HORIZONTAL',
    'ANGULAR',
    'TOP_HEAVY',
    'TAPERED',
    'FULL',
    'ELONGATED',
    'ASYMMETRIC',
  ];
  protected readonly layerStructures = [
    'BLUNT',
    'UNIFORM',
    'SOFT_GRADUATED',
    'GRADUATED',
    'STACKED',
    'LAYERED',
    'LONG_LAYERS',
    'INTERNAL_LAYERS',
    'DISCONNECTED',
    'TEXTURED',
    'CHOPPY',
    'FEATHERED',
    'RAZOR',
    'TAPERED',
  ];
  protected readonly perimeterShapes = [
    'NATURAL',
    'STRAIGHT',
    'ROUNDED',
    'U_SHAPE',
    'V_SHAPE',
    'A_LINE',
    'CONCAVE',
    'CONVEX',
    'ASYMMETRIC',
    'DISCONNECTED',
  ];
  protected readonly fringeTypes = [
    'NONE',
    'MICRO',
    'BABY',
    'SHORT_STRAIGHT',
    'FULL',
    'SOFT_FULL',
    'WISPY',
    'AIRY',
    'BOTTLENECK',
    'CURTAIN',
    'LONG_CURTAIN',
    'SIDE_SWEPT',
    'LONG_SIDE',
    'DIAGONAL',
    'CHOPPY',
    'SHAG',
    'CURLY',
    'TEXTURED',
    'FACE_FRAMING',
  ];
  protected readonly napeShapes = [
    'NATURAL',
    'SOFT_TAPERED',
    'TAPERED',
    'ROUNDED',
    'SQUARED',
    'SHORT_DEFINED',
    'STACKED',
    'SHAVED',
    'LONG',
  ];
  protected readonly fadeTypes = [
    'NONE',
    'TAPER',
    'LOW_TAPER',
    'LOW_FADE',
    'MID_FADE',
    'HIGH_FADE',
    'SKIN_FADE',
  ];
  protected readonly earExposures = ['COVERED', 'PARTIALLY_EXPOSED', 'EXPOSED'];
  protected readonly hairTypes = ['STRAIGHT', 'WAVY', 'CURLY', 'COILY'];
  protected readonly faceShapes = [
    'OVAL',
    'ROUND',
    'SQUARE',
    'RECTANGULAR',
    'OBLONG',
    'HEART',
    'INVERTED_TRIANGLE',
    'TRIANGULAR',
    'DIAMOND',
  ];
  protected readonly densities = ['LOW', 'MEDIUM', 'HIGH'];
  protected readonly beardDensities = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  protected readonly currentHairLengths = ['VERY_SHORT', 'SHORT', 'MEDIUM', 'LONG', 'VERY_LONG'];
  protected readonly foreheadLevels = ['LOW', 'MEDIUM', 'HIGH'];
  protected readonly beardStyles = [
    'CLEAN_SHAVEN',
    'STUBBLE',
    'SHORT_BOXED',
    'FULL_BEARD',
    'LONG_BEARD',
    'GOATEE',
    'CIRCLE_BEARD',
    'VAN_DYKE',
    'BALBO',
    'ANCHOR',
    'CHIN_STRAP',
    'DUCKTAIL',
    'GARIBALDI',
    'MOUSTACHE_ONLY',
    'BEARD_AND_MOUSTACHE',
    'CUSTOM',
  ];
  protected readonly beardLengths = [
    'SHAVED',
    'VERY_SHORT',
    'SHORT',
    'MEDIUM',
    'LONG',
    'VERY_LONG',
  ];
  protected readonly moustacheStyles = [
    'NONE',
    'NATURAL',
    'SHORT',
    'PENCIL',
    'CHEVRON',
    'HANDLEBAR',
    'HORSESHOE',
    'WALRUS',
    'DISCONNECTED',
    'CUSTOM',
  ];
  protected readonly moustacheConnections = ['CONNECTED', 'PARTIALLY_CONNECTED', 'DISCONNECTED'];
  protected readonly beardLines = ['NATURAL', 'HIGH', 'MEDIUM', 'LOW', 'DEFINED'];
  protected readonly growthPatterns = [
    'UNIFORM',
    'PATCHY_CHEEKS',
    'PATCHY_CHIN',
    'PATCHY_SIDES',
    'STRONG_CHIN',
    'STRONG_MOUSTACHE',
    'DISCONNECTED_MOUSTACHE',
    'IRREGULAR',
  ];

  ngOnInit(): void {
    this.loadSummary();
    this.loadActiveTab();
  }

  protected selectTab(tab: CatalogTab): void {
    this.activeTab.set(tab);
    this.formOpen.set(false);
    this.errorMessage.set('');
    this.loadActiveTab();
  }

  protected toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  protected applyFilters(): void {
    this.loadActiveTab();
  }

  protected resetFilters(): void {
    if (this.activeTab() === 'haircuts') {
      this.haircutFilters = {
        gender: 'FEMALE',
        query: '',
        family: '',
        lengthCategory: '',
        hairType: '',
        faceShape: '',
        density: '',
        undercutPresent: '',
        fadeType: '',
        fringeType: '',
        includeInactive: this.canManage,
      };
    } else if (this.activeTab() === 'fringes') {
      this.fringeFilters = {
        gender: 'FEMALE',
        query: '',
        fringeType: '',
        faceShape: '',
        hairType: '',
        density: '',
        includeInactive: this.canManage,
      };
    } else {
      this.beardFilters = {
        query: '',
        style: '',
        length: '',
        faceShape: '',
        density: '',
        growthPattern: '',
        includeInactive: this.canManage,
      };
    }
    this.loadActiveTab();
  }

  protected items(): StyleCatalogItem[] {
    if (this.activeTab() === 'haircuts') return this.haircuts();
    if (this.activeTab() === 'fringes') return this.fringes();
    return this.beards();
  }

  protected openCreate(): void {
    this.formModel = this.newForm(this.activeTab());
    this.editing.set(false);
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.removeCurrentImage.set(false);
    this.formOpen.set(true);
  }

  protected openEdit(item: StyleCatalogItem): void {
    this.formModel = this.formFromItem(item);
    this.editing.set(true);
    this.selectedImage.set(null);
    this.imagePreview.set(this.imageUrl(item.referenceImageUrl));
    this.removeCurrentImage.set(false);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.removeCurrentImage.set(false);
  }

  protected save(): void {
    if (!this.formModel.code.trim() || !this.formModel.name.trim()) {
      this.toastService.warning('Completa codice e nome');
      return;
    }
    if (!this.formModel.technicalDescription.trim()) {
      this.toastService.warning('Aggiungi una spiegazione tecnica breve');
      return;
    }

    this.saving.set(true);
    this.saveRecord()
      .pipe(
        switchMap((saved) => {
          const id = saved.id;
          if (!id) return of(saved);
          const image = this.selectedImage();
          if (image) {
            return this.styleCatalogService.uploadImage(this.activeTab(), id, image).pipe(
              catchError(() => {
                this.toastService.warning(
                  'Elemento salvato senza immagine',
                  'Il record è stato creato correttamente, ma il caricamento della reference non è riuscito.',
                );
                return of(saved);
              }),
            );
          }
          if (this.removeCurrentImage()) {
            return this.styleCatalogService.removeImage(this.activeTab(), id).pipe(
              catchError(() => {
                this.toastService.warning(
                  'Elemento salvato',
                  'Non è stato possibile rimuovere il file immagine.',
                );
                return of(saved);
              }),
            );
          }
          return of(saved);
        }),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toastService.success(this.editing() ? 'Elemento aggiornato' : 'Elemento inserito');
          this.closeForm();
          this.loadSummary();
          this.loadActiveTab();
        },
        error: (error) => {
          this.saving.set(false);
          this.toastService.error(
            'Salvataggio non riuscito',
            error?.error?.message || 'Controlla i dati inseriti.',
          );
        },
      });
  }

  protected async deleteItem(item: StyleCatalogItem): Promise<void> {
    if (!item.id) return;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminare dal catalogo?',
      message: `${this.displayName(item.name)} verrà eliminato definitivamente. Il motore non potrà più proporlo.`,
      confirmLabel: 'Elimina definitivamente',
      severity: 'danger',
    });
    if (!confirmed) return;

    this.deleteRecord(item.id).subscribe({
      next: () => {
        this.toastService.success('Elemento eliminato');
        this.loadSummary();
        this.loadActiveTab();
      },
      error: (error) =>
        this.toastService.error('Eliminazione non riuscita', error?.error?.message || 'Riprova.'),
    });
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.toastService.warning('Formato non supportato', 'Usa JPG, PNG oppure WEBP.');
      input.value = '';
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      this.toastService.warning('Immagine troppo grande', 'Il limite è 6 MB.');
      input.value = '';
      return;
    }
    this.selectedImage.set(file);
    this.removeCurrentImage.set(false);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  protected clearImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.removeCurrentImage.set(true);
  }

  protected toggleSelection(field: MultiValueField, value: string): void {
    const values = this.formModel[field];
    this.formModel[field] = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
  }

  protected selected(field: MultiValueField, value: string): boolean {
    return this.formModel[field].includes(value);
  }

  protected goBack(): void {
    this.location.back();
  }

  protected label(value?: string | null): string {
    return hairLabTechnicalLabel(value);
  }

  protected displayName(name: string): string {
    return hairLabCatalogName(name);
  }

  protected simpleDescription(item: StyleCatalogItem): string {
    const description = item.technicalDescription?.trim() || 'Scheda tecnica da completare.';
    const separator = description.indexOf(':');
    const visibleText =
      separator > 0 && separator < 90 ? description.slice(separator + 1).trim() : description;
    return hairLabTechnicalText(visibleText);
  }

  protected imageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/assets/')) return url;
    if (url.startsWith('/hairlab/')) return `${HAIRLAB_SERVER_BASE_URL}${url}`;
    return url;
  }

  protected imageAlt(item: StyleCatalogItem): string {
    return `Reference visiva ${this.displayName(item.name)}`;
  }

  protected itemTypeLabel(): string {
    if (this.activeTab() === 'haircuts') return 'taglio';
    if (this.activeTab() === 'fringes') return 'frangia';
    return 'modello barba';
  }

  protected countLabel(): string {
    const count = this.items().length;
    return `${count} ${count === 1 ? 'risultato' : 'risultati'}`;
  }

  protected primaryMetrics(item: StyleCatalogItem): Array<[string, string]> {
    if (this.isHaircut(item)) {
      return [
        ['Lunghezza', this.label(item.lengthCategory)],
        ['Struttura', this.label(item.layerStructure)],
        ['Silhouette', this.label(item.silhouette)],
      ];
    }
    if (this.isFringe(item)) {
      return [
        ['Tipo', this.label(item.fringeType)],
        ['Centro', this.range(item.centerLengthMinMm, item.centerLengthMaxMm)],
        ['Lati', this.range(item.sideLengthMinMm, item.sideLengthMaxMm)],
      ];
    }
    return [
      ['Modello', this.label(item.style)],
      ['Lunghezza', this.label(item.suggestedLength)],
      ['Baffi', this.label(item.moustacheStyle)],
    ];
  }

  protected compatibilityText(item: StyleCatalogItem): string {
    const faces = item.compatibleFaceShapes?.slice(0, 3).map((value) => this.label(value)) ?? [];
    return faces.length ? faces.join(' · ') : 'Compatibilità ampia';
  }

  protected detailRows(item: StyleCatalogItem): Array<[string, string]> {
    if (this.isHaircut(item)) {
      return [
        ['Famiglia', this.label(item.family)],
        ['Perimetro', this.label(item.perimeterShape)],
        ['Frangia', this.label(item.defaultFringeType)],
        ['Nuca', this.label(item.napeShape)],
        ['Sfumatura', this.label(item.fadeType)],
        ['Orecchie', this.label(item.earExposure)],
        ['Sommità', this.range(item.crownLengthMinMm, item.crownLengthMaxMm)],
        ['Laterali', this.range(item.sideLengthMinMm, item.sideLengthMaxMm)],
        ['Nuca', this.range(item.napeLengthMinMm, item.napeLengthMaxMm)],
        ['Capelli', this.join(item.compatibleHairTypes)],
        ['Densità', this.join(item.compatibleDensities)],
      ];
    }
    if (this.isFringe(item)) {
      return [
        ['Tipo', this.label(item.fringeType)],
        ['Centro', this.range(item.centerLengthMinMm, item.centerLengthMaxMm)],
        ['Lati', this.range(item.sideLengthMinMm, item.sideLengthMaxMm)],
        ['Fronte', this.join(item.compatibleForeheadLevels)],
        ['Capelli', this.join(item.compatibleHairTypes)],
        ['Densità', this.join(item.compatibleDensities)],
      ];
    }
    return [
      ['Modello', this.label(item.style)],
      ['Lunghezza', this.range(item.minLengthMm, item.maxLengthMm)],
      ['Baffi', this.label(item.moustacheStyle)],
      ['Collegamento', this.label(item.moustacheConnection)],
      ['Linea guance', this.label(item.cheekLine)],
      ['Linea collo', this.label(item.neckline)],
      ['Densità', this.join(item.compatibleDensities)],
      ['Crescita', this.join(item.compatibleGrowthPatterns)],
    ];
  }

  protected isHaircut(item: StyleCatalogItem): item is HaircutDefinitionCatalog {
    return 'family' in item;
  }

  protected isFringe(item: StyleCatalogItem): item is FringeDefinitionCatalog {
    return 'fringeType' in item && !('family' in item);
  }

  private loadSummary(): void {
    this.styleCatalogService.getSummary().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.summary.set(null),
    });
  }

  private loadActiveTab(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    let request: Observable<StyleCatalogItem[]>;
    if (this.activeTab() === 'haircuts') {
      request = this.styleCatalogService.getHaircuts(this.haircutFilters);
    } else if (this.activeTab() === 'fringes') {
      request = this.styleCatalogService.getFringes(this.fringeFilters);
    } else {
      request = this.styleCatalogService.getBeards(this.beardFilters);
    }

    request.subscribe({
      next: (items: StyleCatalogItem[]) => {
        if (this.activeTab() === 'haircuts') this.haircuts.set(items as HaircutDefinitionCatalog[]);
        else if (this.activeTab() === 'fringes')
          this.fringes.set(items as FringeDefinitionCatalog[]);
        else this.beards.set(items as BeardStyleDefinitionCatalog[]);
        this.loading.set(false);
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Catalogo non disponibile.');
      },
    });
  }

  private saveRecord(): Observable<StyleCatalogItem> {
    const id = this.formModel.id;
    if (this.activeTab() === 'haircuts') {
      const payload = this.haircutPayload();
      return id
        ? this.styleCatalogService.updateHaircut(id, payload)
        : this.styleCatalogService.createHaircut(payload);
    }
    if (this.activeTab() === 'fringes') {
      const payload = this.fringePayload();
      return id
        ? this.styleCatalogService.updateFringe(id, payload)
        : this.styleCatalogService.createFringe(payload);
    }
    const payload = this.beardPayload();
    return id
      ? this.styleCatalogService.updateBeard(id, payload)
      : this.styleCatalogService.createBeard(payload);
  }

  private deleteRecord(id: number): Observable<unknown> {
    if (this.activeTab() === 'haircuts') return this.styleCatalogService.deleteHaircut(id);
    if (this.activeTab() === 'fringes') return this.styleCatalogService.deleteFringe(id);
    return this.styleCatalogService.deleteBeard(id);
  }

  private haircutPayload(): HaircutDefinitionCatalog {
    const value = this.formModel;
    return {
      id: value.id,
      code: value.code,
      name: value.name,
      gender: value.gender,
      family: value.family,
      lengthCategory: value.lengthCategory,
      silhouette: value.silhouette,
      layerStructure: value.layerStructure,
      perimeterShape: value.perimeterShape,
      defaultFringeType: value.defaultFringeType,
      napeShape: value.napeShape,
      fadeType: value.fadeType,
      earExposure: value.earExposure,
      undercutPresent: value.undercutPresent,
      asymmetrical: value.asymmetrical,
      disconnected: value.disconnected,
      faceFramingPresent: value.faceFramingPresent,
      crownLengthMinMm: value.crownLengthMinMm,
      crownLengthMaxMm: value.crownLengthMaxMm,
      fringeLengthMinMm: value.fringeLengthMinMm,
      fringeLengthMaxMm: value.fringeLengthMaxMm,
      sideLengthMinMm: value.sideLengthMinMm,
      sideLengthMaxMm: value.sideLengthMaxMm,
      napeLengthMinMm: value.napeLengthMinMm,
      napeLengthMaxMm: value.napeLengthMaxMm,
      referenceImageUrl: value.referenceImageUrl,
      technicalDescription: value.technicalDescription,
      futureSimulationDescriptor: value.futureSimulationDescriptor || null,
      futureSimulationReady: value.futureSimulationReady,
      active: value.active,
      compatibleFaceShapes: value.compatibleFaceShapes,
      compatibleHairTypes: value.compatibleHairTypes,
      compatibleDensities: value.compatibleDensities,
      compatibleCurrentLengths: value.compatibleCurrentLengths,
    };
  }

  private fringePayload(): FringeDefinitionCatalog {
    const value = this.formModel;
    return {
      id: value.id,
      code: value.code,
      name: value.name,
      gender: value.gender,
      fringeType: value.fringeType,
      centerLengthMinMm: value.centerLengthMinMm,
      centerLengthMaxMm: value.centerLengthMaxMm,
      sideLengthMinMm: value.sideLengthMinMm,
      sideLengthMaxMm: value.sideLengthMaxMm,
      referenceImageUrl: value.referenceImageUrl,
      technicalDescription: value.technicalDescription,
      futureSimulationDescriptor: value.futureSimulationDescriptor || null,
      futureSimulationReady: value.futureSimulationReady,
      active: value.active,
      compatibleFaceShapes: value.compatibleFaceShapes,
      compatibleForeheadLevels: value.compatibleForeheadLevels,
      compatibleHairTypes: value.compatibleHairTypes,
      compatibleDensities: value.compatibleDensities,
    };
  }

  private beardPayload(): BeardStyleDefinitionCatalog {
    const value = this.formModel;
    return {
      id: value.id,
      code: value.code,
      name: value.name,
      style: value.style,
      suggestedLength: value.suggestedLength,
      minLengthMm: value.minLengthMm,
      maxLengthMm: value.maxLengthMm,
      moustacheStyle: value.moustacheStyle,
      moustacheConnection: value.moustacheConnection,
      cheekLine: value.cheekLine,
      neckline: value.neckline,
      referenceImageUrl: value.referenceImageUrl,
      technicalDescription: value.technicalDescription,
      futureSimulationDescriptor: value.futureSimulationDescriptor || null,
      futureSimulationReady: value.futureSimulationReady,
      active: value.active,
      compatibleFaceShapes: value.compatibleFaceShapes,
      compatibleDensities: value.compatibleDensities,
      compatibleGrowthPatterns: value.compatibleGrowthPatterns,
    };
  }

  private formFromItem(item: StyleCatalogItem): CatalogFormModel {
    const form = this.newForm(this.activeTab());
    Object.assign(form, item);
    form.referenceImageUrl = item.referenceImageUrl ?? null;
    form.compatibleFaceShapes = [...(item.compatibleFaceShapes ?? [])];
    form.compatibleDensities = [...(item.compatibleDensities ?? [])];
    if (this.isHaircut(item)) {
      form.compatibleHairTypes = [...(item.compatibleHairTypes ?? [])];
      form.compatibleCurrentLengths = [...(item.compatibleCurrentLengths ?? [])];
    } else if (this.isFringe(item)) {
      form.compatibleHairTypes = [...(item.compatibleHairTypes ?? [])];
      form.compatibleForeheadLevels = [...(item.compatibleForeheadLevels ?? [])];
    } else {
      form.compatibleGrowthPatterns = [...(item.compatibleGrowthPatterns ?? [])];
    }
    return form;
  }

  private newForm(tab: CatalogTab): CatalogFormModel {
    return {
      code: '',
      name: '',
      active: true,
      technicalDescription: '',
      futureSimulationDescriptor: '',
      futureSimulationReady: false,
      referenceImageUrl: null,
      gender: 'FEMALE',
      family: tab === 'haircuts' ? 'PIXIE' : '',
      lengthCategory: 'SHORT',
      silhouette: 'BALANCED',
      layerStructure: 'LAYERED',
      perimeterShape: 'NATURAL',
      defaultFringeType: 'NONE',
      napeShape: 'NATURAL',
      fadeType: 'NONE',
      earExposure: 'PARTIALLY_EXPOSED',
      undercutPresent: false,
      asymmetrical: false,
      disconnected: false,
      faceFramingPresent: false,
      crownLengthMinMm: null,
      crownLengthMaxMm: null,
      fringeLengthMinMm: null,
      fringeLengthMaxMm: null,
      sideLengthMinMm: null,
      sideLengthMaxMm: null,
      napeLengthMinMm: null,
      napeLengthMaxMm: null,
      fringeType: 'CURTAIN',
      centerLengthMinMm: null,
      centerLengthMaxMm: null,
      style: 'SHORT_BOXED',
      suggestedLength: 'SHORT',
      minLengthMm: null,
      maxLengthMm: null,
      moustacheStyle: 'NATURAL',
      moustacheConnection: 'CONNECTED',
      cheekLine: 'NATURAL',
      neckline: 'DEFINED',
      compatibleFaceShapes: [],
      compatibleForeheadLevels: [],
      compatibleHairTypes: [],
      compatibleDensities: [],
      compatibleCurrentLengths: [],
      compatibleGrowthPatterns: [],
    };
  }

  private range(min?: number | null, max?: number | null): string {
    if (min == null && max == null) return 'Da definire';
    if (min == null) return `fino a ${max} mm`;
    if (max == null) return `da ${min} mm`;
    return `${min}–${max} mm`;
  }

  private join(values?: string[] | null): string {
    if (!values?.length) return 'Non vincolato';
    return values.map((value) => this.label(value)).join(', ');
  }
}
