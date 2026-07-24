import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { HairDye } from '../../../models/hair-dye';
import { HairDyeInventory } from '../../../models/hair-dye-inventory';
import { ProductType } from '../../../models/enums/product-type';
import { MixingRatio } from '../../../models/enums/mixing-ratio';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';
import { HairDyeInventoryService } from '../../../service/hair-dye-inventory-service';
import { HairDyeService } from '../../../service/hair-dye-service';
import {
  INVENTORY_UNIT_LABELS,
  PRODUCT_TYPE_LABELS,
  REFLECTION_COLORS,
  REFLECTION_LABELS,
  TONE_LEVEL_COLORS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';
import {
  MIXING_RATIO_LABELS,
  OXYGEN_LABELS
} from '../color-formula-display';

type ColorLabTab = 'OVERVIEW' | 'LIBRARY' | 'INVENTORY';
type ActiveFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';
type StockFilter = 'ALL' | 'OK' | 'LOW' | 'OUT' | 'UNTRACKED';
type StockState = 'OK' | 'LOW' | 'OUT' | 'UNTRACKED';

/**
 * Pagina principale Color Lab.
 * Riunisce panoramica, libreria tecnica e magazzino.
 */
@Component({
  selector: 'app-color-lab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './color-lab.html',
  styleUrl: './color-lab.css'
})
export class ColorLabComponent implements OnInit {

  private readonly hairDyeService = inject(HairDyeService);
  private readonly inventoryService = inject(HairDyeInventoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly products = signal<HairDye[]>([]);
  protected readonly inventories = signal<HairDyeInventory[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly selectedTab = signal<ColorLabTab>('OVERVIEW');

  protected readonly searchTerm = signal('');
  protected readonly productTypeFilter = signal<ProductType | 'ALL'>('ALL');
  protected readonly brandFilter = signal('ALL');
  protected readonly lineFilter = signal('ALL');
  protected readonly toneFilter = signal<ToneLevel | 'ALL'>('ALL');
  protected readonly reflectionFilter = signal<Reflection | 'ALL'>('ALL');
  protected readonly activeFilter = signal<ActiveFilter>('ACTIVE');

  protected readonly stockSearchTerm = signal('');
  protected readonly stockFilter = signal<StockFilter>('ALL');

  protected readonly productTypes = Object.values(ProductType);
  protected readonly toneLevels = Object.values(ToneLevel);
  protected readonly reflections = Object.values(Reflection);

  protected readonly productTypeLabels = PRODUCT_TYPE_LABELS;
  protected readonly toneLevelLabels = TONE_LEVEL_LABELS;
  protected readonly toneLevelColors = TONE_LEVEL_COLORS;
  protected readonly reflectionLabels = REFLECTION_LABELS;
  protected readonly reflectionColors = REFLECTION_COLORS;
  protected readonly inventoryUnitLabels = INVENTORY_UNIT_LABELS;
  protected readonly oxygenLabels = OXYGEN_LABELS;
  protected readonly mixingRatioLabels = MIXING_RATIO_LABELS;

  protected readonly activeProductsCount = computed(
    () => this.products().filter(product => product.active).length
  );

  protected readonly brands = computed(
    () => Array.from(
      new Set(
        this.products()
          .map(product => product.brand.trim())
          .filter(brand => !!brand)
      )
    ).sort((a, b) => a.localeCompare(b, 'it'))
  );


  protected readonly lines = computed(
    () => Array.from(
      new Set(
        this.products()
          .map(
            product =>
              product.lineName?.trim() ??
              ''
          )
          .filter(
            line =>
              !!line
          )
      )
    ).sort(
      (
        a,
        b
      ) =>
        a.localeCompare(
          b,
          'it'
        )
    )
  );

  protected readonly lowStockCount = computed(
    () => this.inventories().filter(
      inventory => this.getInventoryState(inventory) === 'LOW'
    ).length
  );

  protected readonly outOfStockCount = computed(
    () => this.inventories().filter(
      inventory => this.getInventoryState(inventory) === 'OUT'
    ).length
  );

  protected readonly untrackedProductsCount = computed(
    () => this.products().filter(
      product => !this.getInventoryForProduct(product.id)
    ).length
  );

  protected readonly filteredProducts = computed(() => {
    const search = this.normalize(this.searchTerm());

    return this.products()
      .filter(product => {
        if (search) {
          const haystack = this.normalize(
            [product.brand, product.lineName ?? '', product.name, product.code].join(' ')
          );
          if (!haystack.includes(search)) return false;
        }

        if (
          this.productTypeFilter() !== 'ALL' &&
          product.productType !== this.productTypeFilter()
        ) return false;

        if (
          this.brandFilter() !== 'ALL' &&
          product.brand !== this.brandFilter()
        ) return false;

        if (
          this.lineFilter() !== 'ALL' &&
          product.lineName !== this.lineFilter()
        ) return false;

        if (
          this.toneFilter() !== 'ALL' &&
          product.toneLevel !== this.toneFilter()
        ) return false;

        if (
          this.reflectionFilter() !== 'ALL' &&
          product.primaryReflection !== this.reflectionFilter()
        ) return false;

        if (this.activeFilter() === 'ACTIVE' && !product.active) return false;
        if (this.activeFilter() === 'INACTIVE' && product.active) return false;

        return true;
      })
      .sort((a, b) =>
        a.brand.localeCompare(b.brand, 'it') ||
        a.code.localeCompare(b.code, 'it', { numeric: true })
      );
  });

  protected readonly filteredInventoryProducts = computed(() => {
    const search = this.normalize(this.stockSearchTerm());

    return this.products()
      .filter(product => {
        if (search) {
          const haystack = this.normalize(
            [product.brand, product.lineName ?? '', product.name, product.code].join(' ')
          );
          if (!haystack.includes(search)) return false;
        }

        const state = this.getStockState(product);
        return this.stockFilter() === 'ALL' || state === this.stockFilter();
      })
      .sort((a, b) =>
        this.getStockRank(this.getStockState(a)) -
          this.getStockRank(this.getStockState(b)) ||
        a.brand.localeCompare(b.brand, 'it') ||
        a.code.localeCompare(b.code, 'it', { numeric: true })
      );
  });

  ngOnInit(): void {
    /*
     * Il componente viene riutilizzato quando cambia soltanto
     * ?tab=library / ?tab=inventory.
     * Per questo ascoltiamo queryParamMap invece di leggere
     * soltanto lo snapshot iniziale.
     */
    this.activatedRoute.queryParamMap.subscribe(params => {
      const requestedTab = params.get('tab');

      if (requestedTab === 'library') {
        this.selectedTab.set('LIBRARY');
        return;
      }

      if (requestedTab === 'inventory') {
        this.selectedTab.set('INVENTORY');
        return;
      }

      if (!requestedTab) {
        this.selectedTab.set('OVERVIEW');
      }
    });

    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      products: this.hairDyeService.getAll(),
      inventories: this.inventoryService.getAll()
    }).subscribe({
      next: result => {
        this.products.set(result.products ?? []);
        this.inventories.set(result.inventories ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare il Color Lab.')
        );
      }
    });
  }

  protected setTab(tab: ColorLabTab): void {
    this.selectedTab.set(tab);
    this.successMessage.set('');
  }

  protected onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onProductTypeFilterChange(event: Event): void {
    this.productTypeFilter.set(
      (event.target as HTMLSelectElement).value as ProductType | 'ALL'
    );
  }

  protected onBrandFilterChange(event: Event): void {
    this.brandFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onLineFilterChange(event: Event): void {
    this.lineFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onToneFilterChange(event: Event): void {
    this.toneFilter.set(
      (event.target as HTMLSelectElement).value as ToneLevel | 'ALL'
    );
  }

  protected onReflectionFilterChange(event: Event): void {
    this.reflectionFilter.set(
      (event.target as HTMLSelectElement).value as Reflection | 'ALL'
    );
  }

  protected onActiveFilterChange(event: Event): void {
    this.activeFilter.set(
      (event.target as HTMLSelectElement).value as ActiveFilter
    );
  }

  protected onStockSearchChange(event: Event): void {
    this.stockSearchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onStockFilterChange(event: Event): void {
    this.stockFilter.set(
      (event.target as HTMLSelectElement).value as StockFilter
    );
  }

  protected resetLibraryFilters(): void {
    this.searchTerm.set('');
    this.productTypeFilter.set('ALL');
    this.brandFilter.set('ALL');
    this.lineFilter.set('ALL');
    this.toneFilter.set('ALL');
    this.reflectionFilter.set('ALL');
    this.activeFilter.set('ACTIVE');
  }

  protected deactivateProduct(product: HairDye): void {
    if (!product.id || !product.active) return;

    if (!confirm(`Disattivare ${product.brand} ${product.code}?`)) return;

    this.hairDyeService.delete(product.id).subscribe({
      next: () => {
        this.successMessage.set('Prodotto disattivato correttamente.');
        this.loadData();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile disattivare il prodotto.')
        );
      }
    });
  }

  protected activateProduct(product: HairDye): void {
    if (!product.id || product.active) return;

    this.hairDyeService.activate(product.id).subscribe({
      next: () => {
        this.successMessage.set('Prodotto riattivato correttamente.');
        this.loadData();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile riattivare il prodotto.')
        );
      }
    });
  }

  protected getInventoryForProduct(
    productId: number | undefined
  ): HairDyeInventory | undefined {
    if (!productId) return undefined;
    return this.inventories().find(i => i.hairDyeId === productId);
  }

  protected getStockState(product: HairDye): StockState {
    const inventory = this.getInventoryForProduct(product.id);
    return inventory ? this.getInventoryState(inventory) : 'UNTRACKED';
  }

  protected getStockStateLabel(product: HairDye): string {
    switch (this.getStockState(product)) {
      case 'OUT': return 'Esaurito';
      case 'LOW': return 'Scorta bassa';
      case 'OK': return 'Disponibile';
      default: return 'Da configurare';
    }
  }

  protected getInventoryState(
    inventory: HairDyeInventory
  ): Exclude<StockState, 'UNTRACKED'> {
    if (inventory.quantityAvailable <= 0) return 'OUT';
    if (inventory.quantityAvailable <= inventory.lowStockThreshold) return 'LOW';
    return 'OK';
  }

  protected getStockPercent(inventory: HairDyeInventory): number {
    const reference = Math.max(inventory.lowStockThreshold * 4, 1);
    return Math.min(
      100,
      Math.max(0, Math.round((inventory.quantityAvailable / reference) * 100))
    );
  }

  protected formatQuantity(value: number): string {
    return value.toLocaleString('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  protected getProductSwatch(product: HairDye): string {
    if (product.primaryReflection) {
      const reflection = this.reflectionColors[product.primaryReflection];
      if (product.toneLevel) {
        const tone = this.toneLevelColors[product.toneLevel];
        return `linear-gradient(135deg, ${tone} 0%, ${tone} 52%, ${reflection} 100%)`;
      }
      return reflection;
    }

    if (product.toneLevel) return this.toneLevelColors[product.toneLevel];

    switch (product.productType) {
      case ProductType.BLEACH: return '#eee4c9';
      case ProductType.DEVELOPER: return '#e8ecef';
      case ProductType.ADDITIVE: return '#d9d0e5';
      case ProductType.TREATMENT: return '#d6e3db';
      default: return '#d8cdc7';
    }
  }

  protected getToneFieldLabel(product: HairDye): string {
    return product.productType === ProductType.DEVELOPER
      ? 'VOLUME'
      : 'TONO';
  }

  protected getToneLabel(product: HairDye): string {
    if (
      product.productType === ProductType.DEVELOPER
      && product.developerVolume
    ) {
      return this.oxygenLabels[product.developerVolume];
    }

    return product.toneLevel
      ? this.toneLevelLabels[product.toneLevel]
      : 'Non applicabile';
  }

  protected getReflectionLabel(product: HairDye): string {
    return product.primaryReflection
      ? this.reflectionLabels[product.primaryReflection]
      : 'Non applicabile';
  }

  protected supportsTechnicalRulesForProduct(
    product:
      HairDye
  ): boolean {

    return (
      product.productType ===
        ProductType.COLOR
      ||
      product.productType ===
        ProductType.TONER
      ||
      product.productType ===
        ProductType.BLEACH
    );
  }

  /**
   * Indica se il prodotto possiede regole tecniche
   * specifiche configurate sul prodotto o sulla linea.
   *
   * La verifica viene eseguita in TypeScript invece
   * che direttamente nel template Angular.
   *
   * In questo modo il template non deve indicizzare
   * proprietà opzionali estese introdotte nei Blocchi
   * 12/13 e rimane pienamente tipizzato.
   */
  protected hasConfiguredTechnicalRulesForProduct(
    product:
      HairDye
  ): boolean {

    return (
      product.defaultMixingRatio !=
        null
      ||
      (
        product.allowedDeveloperVolumes
          ?.length ??
        0
      ) > 0
      ||
      product.maxLiftLevels !=
        null
      ||
      Boolean(
        product.depositOnly
      )
      ||
      Boolean(
        product.useLineProfileRules
      )
    );
  }

  protected getMixingRuleLabel(
    product:
      HairDye
  ): string {

    if (
      !product.defaultMixingRatio
    ) {

      return 'Fallback HairLab';
    }

    if (
      product.defaultMixingRatio ===
        MixingRatio.CUSTOM
      &&
      product.customMixingRatioMultiplier
    ) {

      return `1 : ${product.customMixingRatioMultiplier}`;
    }

    return this.mixingRatioLabels[
      product.defaultMixingRatio
    ];
  }

  protected getAllowedDeveloperLabel(
    product:
      HairDye
  ): string {

    const values =
      product.allowedDeveloperVolumes ??
      [];

    if (
      values.length ===
      0
    ) {

      return 'Fallback HairLab';
    }

    return values
      .map(
        oxygen =>
          this.oxygenLabels[
            oxygen
          ]
      )
      .join(
        ' · '
      );
  }

  protected getLiftRuleLabel(
    product:
      HairDye
  ): string {

    if (
      product.depositOnly
    ) {

      return 'Solo deposito';
    }

    if (
      product.maxLiftLevels !=
      null
    ) {

      return `Max +${product.maxLiftLevels}`;
    }

    return 'Non configurato';
  }

  private getStockRank(state: StockState): number {
    switch (state) {
      case 'OUT': return 0;
      case 'LOW': return 1;
      case 'UNTRACKED': return 2;
      default: return 3;
    }
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase('it');
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const backendMessage = error.error?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }
    if (error.status === 0) return 'Impossibile comunicare con il backend.';
    return fallback;
  }
}
