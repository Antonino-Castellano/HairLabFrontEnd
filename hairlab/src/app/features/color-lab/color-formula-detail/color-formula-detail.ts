import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ColorFormulaDetail } from '../../../models/color-formula-management';
import { ColorFormulaSimulation, ColorFormulaFeasibility } from '../../../models/color-formula-simulation';
import { ColorFormulaProtocol, ColorFormulaZone } from '../../../models/color-formula-protocol';
import {
  ColorFormulaResult,
  ColorFormulaResultRequest,
  ColorResultAssessment
} from '../../../models/color-formula-result';
import { ColorFormulaUsage } from '../../../models/color-formula-usage';
import { Customer } from '../../../models/customer';
import { HairDye } from '../../../models/hair-dye';
import { HairDyeInventory } from '../../../models/hair-dye-inventory';
import { ColorFormulaStatus } from '../../../models/enums/color-formula-status';
import { ColorFormulaOrigin } from '../../../models/enums/color-formula-origin';
import { InventoryUnit } from '../../../models/enums/inventory-unit';
import { MixingRatio } from '../../../models/enums/mixing-ratio';
import { ProductType } from '../../../models/enums/product-type';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';

import { ColorFormulaHistoryService } from '../../../service/color-formula-history-service';
import { ColorFormulaManagementService } from '../../../service/color-formula-management-service';
import { ColorFormulaProtocolService } from '../../../service/color-formula-protocol-service';
import { ColorFormulaResultService } from '../../../service/color-formula-result-service';
import { ColorFormulaSimulationService } from '../../../service/color-formula-simulation-service';
import { ColorFormulaUsageService } from '../../../service/color-formula-usage-service';
import { CustomerService } from '../../../service/customer-service';
import { HairDyeInventoryService } from '../../../service/hair-dye-inventory-service';
import { HairDyeService } from '../../../service/hair-dye-service';

import {
  COLOR_APPLICATION_LABELS,
  COLOR_FORMULA_ORIGIN_LABELS,
  COLOR_FORMULA_STATUS_LABELS,
  MIXING_RATIO_LABELS,
  OXYGEN_LABELS
} from '../color-formula-display';
import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

/**
 * Dettaglio formula + workflow di utilizzo reale.
 */
@Component({
  selector: 'app-color-formula-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './color-formula-detail.html',
  styleUrl: './color-formula-detail.css'
})
export class ColorFormulaDetailComponent implements OnInit {

  private readonly managementService = inject(ColorFormulaManagementService);
  private readonly protocolService = inject(ColorFormulaProtocolService);
  private readonly historyService = inject(ColorFormulaHistoryService);
  private readonly usageService = inject(ColorFormulaUsageService);
  private readonly resultService = inject(ColorFormulaResultService);
  private readonly simulationService = inject(ColorFormulaSimulationService);
  private readonly customerService = inject(CustomerService);
  private readonly hairDyeService = inject(HairDyeService);
  private readonly inventoryService = inject(HairDyeInventoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly detail = signal<ColorFormulaDetail | null>(null);
  protected readonly protocol = signal<ColorFormulaProtocol | null>(null);
  protected readonly zoneDeveloperSelections = signal<Record<number, number | null>>({});
  protected readonly usage = signal<ColorFormulaUsage | null>(null);
  protected readonly formulaResult =
    signal<ColorFormulaResult | null>(null);

  protected readonly simulation = signal<ColorFormulaSimulation | null>(null);

  protected readonly savingResult =
    signal(false);

  protected readonly creatingRevision =
    signal(false);

  protected readonly referenceAction =
    signal(false);

  protected readonly achievedToneLevel =
    signal<ToneLevel | null>(null);

  protected readonly achievedPrimaryReflection =
    signal<Reflection | null>(null);

  protected readonly achievedSecondaryReflection =
    signal<Reflection | null>(null);

  protected readonly resultAssessment =
    signal<ColorResultAssessment>('GOOD');

  protected readonly technicalResultNotes =
    signal('');

  protected readonly correctionResultNotes =
    signal('');

  protected readonly clientFeedback =
    signal('');

  protected readonly customers = signal<Customer[]>([]);
  protected readonly products = signal<HairDye[]>([]);
  protected readonly inventories = signal<HairDyeInventory[]>([]);

  protected readonly loading = signal(false);
  protected readonly usingFormula = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly selectedDeveloperId = signal<number | null>(null);

  protected readonly statusLabels = COLOR_FORMULA_STATUS_LABELS;
  protected readonly originLabels = COLOR_FORMULA_ORIGIN_LABELS;
  protected readonly applicationLabels = COLOR_APPLICATION_LABELS;
  protected readonly oxygenLabels = OXYGEN_LABELS;
  protected readonly ratioLabels = MIXING_RATIO_LABELS;
  protected readonly toneLabels = TONE_LEVEL_LABELS;
  protected readonly reflectionLabels = REFLECTION_LABELS;

  protected readonly toneLevels =
    Object.values(
      ToneLevel
    );

  protected readonly reflections =
    Object.values(
      Reflection
    );

  protected readonly resultAssessments:
    ColorResultAssessment[] = [
      'EXCELLENT',
      'GOOD',
      'PARTIAL',
      'CORRECTION_REQUIRED'
    ];

  protected readonly resultAssessmentLabels:
    Record<ColorResultAssessment, string> = {

      EXCELLENT:
        'Obiettivo pienamente raggiunto',

      GOOD:
        'Buon risultato',

      PARTIAL:
        'Obiettivo raggiunto in parte',

      CORRECTION_REQUIRED:
        'Correzione necessaria'
    };

  protected readonly developerCandidates = computed(() => {
    const current = this.detail();

    if (!current) return [];

    return this.products()
      .filter(product =>
        !!product.id
        && product.active
        && product.productType === ProductType.DEVELOPER
        && product.developerVolume === current.formula.volumeDeveloper
      )
      .sort((a, b) =>
        a.brand.localeCompare(b.brand, 'it')
        || a.code.localeCompare(b.code, 'it', { numeric: true })
      );
  });

  ngOnInit(): void {
    const id = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage.set('ID formula non valido.');
      return;
    }

    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      detail: this.managementService.getById(id),
      protocol: this.protocolService.getByFormulaId(id),
      simulation: this.simulationService.simulate(id),
      customers: this.customerService.getAll(),
      products: this.hairDyeService.getAll(),
      inventories: this.inventoryService.getAll()
    }).subscribe({
      next: result => {
        this.detail.set(result.detail);
        this.protocol.set(result.protocol);
        this.simulation.set(result.simulation);
        this.customers.set(result.customers ?? []);
        this.products.set(result.products ?? []);
        this.inventories.set(result.inventories ?? []);
        this.autoSelectDeveloper();
        this.autoSelectZoneDevelopers();
        this.loading.set(false);
        this.loadUsage(id);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare la formula.')
        );
      }
    });
  }

  private loadUsage(formulaId: number): void {
    this.usageService.getByFormulaId(formulaId).subscribe({
      next: usage => {
        this.usage.set(usage);
        this.loadFormulaResult(formulaId);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.usage.set(null);
          this.formulaResult.set(null);
          return;
        }

        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare lo storico utilizzo.')
        );
      }
    });
  }

  /**
   * Carica l'eventuale risultato tecnico già registrato.
   */
  private loadFormulaResult(
    formulaId:
      number
  ): void {

    this.resultService
      .getByFormulaId(
        formulaId
      )
      .subscribe({

        next: result => {

          this.formulaResult.set(
            result
          );

          this.achievedToneLevel.set(
            result.achievedToneLevel ??
            null
          );

          this.achievedPrimaryReflection.set(
            result.achievedPrimaryReflection ??
            null
          );

          this.achievedSecondaryReflection.set(
            result.achievedSecondaryReflection ??
            null
          );

          this.resultAssessment.set(
            result.assessment
          );

          this.technicalResultNotes.set(
            result.technicalNotes ??
            ''
          );

          this.correctionResultNotes.set(
            result.correctionNotes ??
            ''
          );

          this.clientFeedback.set(
            result.clientFeedback ??
            ''
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          if (
            error.status ===
            404
          ) {

            this.formulaResult.set(
              null
            );

            return;
          }

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare il risultato tecnico.'
            )
          );
        }
      });
  }

  protected onAchievedToneChange(
    event:
      Event
  ): void {

    const value =
      (
        event.target as
          HTMLSelectElement
      ).value;

    this.achievedToneLevel.set(
      value
        ? value as ToneLevel
        : null
    );
  }

  protected onPrimaryReflectionChange(
    event:
      Event
  ): void {

    const value =
      (
        event.target as
          HTMLSelectElement
      ).value;

    this.achievedPrimaryReflection.set(
      value
        ? value as Reflection
        : null
    );
  }

  protected onSecondaryReflectionChange(
    event:
      Event
  ): void {

    const value =
      (
        event.target as
          HTMLSelectElement
      ).value;

    this.achievedSecondaryReflection.set(
      value
        ? value as Reflection
        : null
    );
  }

  protected onAssessmentChange(
    event:
      Event
  ): void {

    this.resultAssessment.set(
      (
        event.target as
          HTMLSelectElement
      ).value as
        ColorResultAssessment
    );
  }

  protected onTechnicalNotesChange(
    event:
      Event
  ): void {

    this.technicalResultNotes.set(
      (
        event.target as
          HTMLTextAreaElement
      ).value
    );
  }

  protected onCorrectionNotesChange(
    event:
      Event
  ): void {

    this.correctionResultNotes.set(
      (
        event.target as
          HTMLTextAreaElement
      ).value
    );
  }

  protected onClientFeedbackChange(
    event:
      Event
  ): void {

    this.clientFeedback.set(
      (
        event.target as
          HTMLTextAreaElement
      ).value
    );
  }

  /**
   * Salva il risultato post-servizio.
   *
   * Non modifica:
   *
   * - formula;
   * - ingredienti;
   * - utilizzo;
   * - movimenti magazzino.
   */
  protected saveFormulaResult():
    void {

    const current =
      this.detail();

    if (
      !current?.formula.id
      ||
      !this.usage()
    ) {

      this.errorMessage.set(
        'Il risultato può essere registrato soltanto dopo l’utilizzo reale della formula.'
      );

      return;
    }

    const request:
      ColorFormulaResultRequest = {

      achievedToneLevel:
        this.achievedToneLevel(),

      achievedPrimaryReflection:
        this.achievedPrimaryReflection(),

      achievedSecondaryReflection:
        this.achievedSecondaryReflection(),

      assessment:
        this.resultAssessment(),

      technicalNotes:
        this.technicalResultNotes()
          .trim(),

      correctionNotes:
        this.correctionResultNotes()
          .trim(),

      clientFeedback:
        this.clientFeedback()
          .trim()
    };

    this.savingResult.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );

    this.resultService
      .save(
        current.formula.id,
        request
      )
      .subscribe({

        next: result => {

          this.formulaResult.set(
            result
          );

          this.savingResult.set(
            false
          );

          this.successMessage.set(
            'Risultato tecnico post-servizio salvato correttamente.'
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.savingResult.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile salvare il risultato tecnico.'
            )
          );
        }
      });
  }

  protected hasMultiZoneProtocol(): boolean {
    return (this.protocol()?.zones?.length ?? 0) > 0;
  }

  protected getZoneDeveloperCandidates(zone: ColorFormulaZone): HairDye[] {
    return this.products()
      .filter(product =>
        !!product.id
        && product.active
        && product.productType === ProductType.DEVELOPER
        && product.developerVolume === zone.developerVolume
      )
      .sort((a, b) =>
        a.brand.localeCompare(b.brand, 'it')
        || a.code.localeCompare(b.code, 'it', { numeric: true })
      );
  }

  protected getZoneDeveloperSelection(zoneId: number | undefined): number | null {
    if (!zoneId) return null;
    return this.zoneDeveloperSelections()[zoneId] ?? null;
  }

  protected onZoneDeveloperChange(zoneId: number | undefined, event: Event): void {
    if (!zoneId) return;
    const value = (event.target as HTMLSelectElement).value;
    this.zoneDeveloperSelections.update(current => ({
      ...current,
      [zoneId]: value ? Number(value) : null
    }));
  }

  protected getZoneColorQuantity(zone: ColorFormulaZone): number {
    return (zone.ingredients ?? []).reduce(
      (sum, item) => sum + Number(item.quantity ?? 0),
      0
    );
  }

  protected getZoneDeveloperQuantity(zone: ColorFormulaZone): number {
    const color = this.getZoneColorQuantity(zone);
    let multiplier = 1;
    switch (zone.mixingRatio) {
      case MixingRatio.RATIO_1_TO_1_5: multiplier = 1.5; break;
      case MixingRatio.RATIO_1_TO_2: multiplier = 2; break;
      case MixingRatio.RATIO_1_TO_3: multiplier = 3; break;
      case MixingRatio.CUSTOM: multiplier = Number(zone.customDeveloperRatio ?? 0); break;
      default: multiplier = 1;
    }
    return Number((color * multiplier).toFixed(2));
  }

  private autoSelectZoneDevelopers(): void {
    const zones = this.protocol()?.zones ?? [];
    const selections: Record<number, number | null> = {};

    for (const zone of zones) {
      if (!zone.id) continue;
      const needed = this.getZoneDeveloperQuantity(zone);
      const candidates = this.getZoneDeveloperCandidates(zone);
      const sufficient = candidates.find(candidate => {
        if (!candidate.id) return false;
        const inventory = this.getInventory(candidate.id);
        return !!inventory && Number(inventory.quantityAvailable) >= needed;
      });
      selections[zone.id] = (sufficient ?? candidates[0])?.id ?? null;
    }

    this.zoneDeveloperSelections.set(selections);
  }

  private areZoneDeveloperStocksSufficient(): boolean {
    const zones = this.protocol()?.zones ?? [];
    const required = new Map<number, number>();

    for (const zone of zones) {
      if (!zone.id) return false;
      const developerId = this.getZoneDeveloperSelection(zone.id);
      if (!developerId) return false;
      required.set(
        developerId,
        (required.get(developerId) ?? 0) + this.getZoneDeveloperQuantity(zone)
      );
    }

    for (const [developerId, quantity] of required.entries()) {
      const inventory = this.getInventory(developerId);
      if (!inventory || Number(inventory.quantityAvailable) < quantity) return false;
    }

    return true;
  }

  private autoSelectDeveloper(): void {
    const sufficient = this.developerCandidates().find(
      developer => this.isDeveloperStockSufficient(developer)
    );

    const selected = sufficient ?? this.developerCandidates()[0];
    this.selectedDeveloperId.set(selected?.id ?? null);
  }

  protected onDeveloperChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedDeveloperId.set(value ? Number(value) : null);
  }

  protected isReferenceFormula(): boolean {
    return this.detail()?.formula.referenceFormula === true;
  }

  protected canSetReferenceFormula(): boolean {
    const formula = this.detail()?.formula;
    return !!formula?.id
      && !formula.referenceFormula
      && (
        formula.status === ColorFormulaStatus.USED
        || formula.status === ColorFormulaStatus.ARCHIVED
      );
  }

  protected setAsReferenceFormula(): void {
    const formulaId = this.detail()?.formula.id;
    if (!formulaId || this.referenceAction()) return;

    this.referenceAction.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.historyService.setReferenceFormula(formulaId).subscribe({
      next: formula => {
        const current = this.detail();
        if (current) this.detail.set({ ...current, formula });
        this.referenceAction.set(false);
        this.successMessage.set('Formula impostata come riferimento corrente della cliente.');
      },
      error: (error: HttpErrorResponse) => {
        this.referenceAction.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile impostare la formula come riferimento.')
        );
      }
    });
  }

  protected clearReferenceFormula(): void {
    const formulaId = this.detail()?.formula.id;
    if (!formulaId || this.referenceAction()) return;

    this.referenceAction.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.historyService.clearReferenceFormula(formulaId).subscribe({
      next: formula => {
        const current = this.detail();
        if (current) this.detail.set({ ...current, formula });
        this.referenceAction.set(false);
        this.successMessage.set('Formula rimossa dai riferimenti correnti della cliente.');
      },
      error: (error: HttpErrorResponse) => {
        this.referenceAction.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile rimuovere la formula di riferimento.')
        );
      }
    });
  }

  protected canCreateRevision(): boolean {
    const status =
      this.detail()?.formula.status;

    return (
      status === ColorFormulaStatus.USED
      ||
      status === ColorFormulaStatus.ARCHIVED
    );
  }

  /**
   * Crea una nuova revisione senza alterare la formula storica.
   *
   * Il backend collega automaticamente la nuova bozza
   * alla formula corrente tramite parentFormulaId.
   */
  protected createRevision(): void {
    const formulaId =
      this.detail()?.formula.id;

    if (
      !formulaId
      ||
      this.creatingRevision()
    ) {

      return;
    }

    this.creatingRevision.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.historyService
      .duplicateAsDraft(
        formulaId
      )
      .subscribe({

        next: detail => {

          this.creatingRevision.set(false);

          if (
            detail.formula.id
          ) {

            this.router.navigate(
              [
                '/color-lab/formulas',
                detail.formula.id,
                'edit'
              ]
            );
          }
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.creatingRevision.set(false);

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile creare una revisione della formula.'
            )
          );
        }
      });
  }

  protected getOriginLabel(
    origin:
      ColorFormulaOrigin |
      null |
      undefined
  ): string {

    return origin
      ? this.originLabels[origin]
      : 'Manuale';
  }

  protected canEditFormula(): boolean {
    const status = this.detail()?.formula.status;
    return status === ColorFormulaStatus.DRAFT
      || status === ColorFormulaStatus.PROPOSED;
  }

  protected canUseFormula(): boolean {
    if (!this.canEditFormula() || this.usingFormula()) return false;
    if (!this.areIngredientStocksSufficient()) return false;

    if (this.hasMultiZoneProtocol()) {
      const report = this.protocol()?.compatibility;
      if (!report?.valid || !report.executionReady) return false;
      return this.areZoneDeveloperStocksSufficient();
    }

    const developerId = this.selectedDeveloperId();
    if (!developerId) return false;

    const developer = this.products().find(item => item.id === developerId);
    return !!developer && this.isDeveloperStockSufficient(developer);
  }

  protected useFormula(): void {
    const current = this.detail();
    if (!current?.formula.id) return;

    if (!this.canUseFormula()) {
      this.errorMessage.set(
        'La formula non può essere utilizzata: verifica protocollo, compatibilità tecnica, ingredienti e developer in magazzino.'
      );
      return;
    }

    const request = this.hasMultiZoneProtocol()
      ? {
          zoneDevelopers: (this.protocol()?.zones ?? [])
            .filter(zone => !!zone.id)
            .map(zone => ({
              zoneId: zone.id!,
              developerHairDyeId: this.getZoneDeveloperSelection(zone.id)!
            }))
        }
      : {
          developerHairDyeId: this.selectedDeveloperId()!
        };

    const confirmed = window.confirm(
      this.hasMultiZoneProtocol()
        ? 'Confermi l’utilizzo reale del protocollo multi-zona?\n\nHairLab scaricherà ingredienti e i developer specifici di ogni zona in un’unica transazione.'
        : 'Confermi l’utilizzo reale della formula?\n\nHairLab scaricherà definitivamente ingredienti e developer dal magazzino e imposterà la formula come UTILIZZATA.'
    );

    if (!confirmed) return;

    this.usingFormula.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usageService.useFormula(
      current.formula.id,
      request
    ).subscribe({
      next: usage => {
        this.usage.set(usage);
        this.usingFormula.set(false);
        this.successMessage.set(
          this.hasMultiZoneProtocol()
            ? 'Protocollo multi-zona utilizzato correttamente. Tutti gli scarichi sono stati registrati.'
            : 'Formula utilizzata correttamente. Il magazzino è stato aggiornato.'
        );
        this.load(current.formula.id!);
      },
      error: (error: HttpErrorResponse) => {
        this.usingFormula.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile utilizzare la formula.')
        );
      }
    });
  }

  protected getCustomerName(customerId: number | undefined): string {
    const customer = this.customers().find(item => item.id === customerId);
    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Cliente non disponibile';
  }

  protected getProductName(hairDyeId: number): string {
    const product = this.products().find(item => item.id === hairDyeId);
    return product
      ? `${product.brand} · ${product.code} · ${product.name}`
      : `Prodotto #${hairDyeId}`;
  }

  protected getInventory(hairDyeId: number): HairDyeInventory | undefined {
    return this.inventories().find(item => item.hairDyeId === hairDyeId);
  }

  protected isIngredientStockSufficient(
    hairDyeId: number,
    quantity: number
  ): boolean {
    const inventory = this.getInventory(hairDyeId);
    return !!inventory
      && inventory.unit === InventoryUnit.GRAM
      && inventory.quantityAvailable >= quantity;
  }

  protected areIngredientStocksSufficient(): boolean {
    const current = this.detail();
    if (!current || current.ingredients.length === 0) return false;

    return current.ingredients.every(item =>
      this.isIngredientStockSufficient(item.hairDyeId, item.quantity)
    );
  }

  protected getDeveloperInventory(
    developer: HairDye
  ): HairDyeInventory | undefined {
    if (!developer.id) return undefined;
    return this.getInventory(developer.id);
  }

  protected isDeveloperStockSufficient(developer: HairDye): boolean {
    const current = this.detail();
    const inventory = this.getDeveloperInventory(developer);

    return !!current
      && !!inventory
      && inventory.unit === InventoryUnit.MILLILITER
      && inventory.quantityAvailable >= current.developerQuantity;
  }

  protected getRatioLabel(): string {
    const current = this.detail();
    if (!current) return '—';

    if (current.formula.mixingRatio === 'CUSTOM') {
      return `1 : ${current.formula.customDeveloperRatio ?? '—'}`;
    }

    return this.ratioLabels[current.formula.mixingRatio];
  }

  protected getUnitLabel(unit: InventoryUnit): string {
    return unit === InventoryUnit.MILLILITER ? 'ml' : 'g';
  }

  protected getFeasibilityLabel(value: ColorFormulaFeasibility): string {
    const labels: Record<ColorFormulaFeasibility, string> = {
      DIRECT_POSSIBLE: 'Percorso diretto plausibile',
      MULTI_STEP: 'Percorso multi-step consigliato',
      NEEDS_DATA: 'Dati insufficienti',
      PROFESSIONAL_REVIEW: 'Rivalutazione professionale necessaria'
    };

    return labels[value];
  }

  protected getConfidenceClass(value: number): string {
    if (value >= 80) return 'high';
    if (value >= 55) return 'medium';
    return 'low';
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    const message = error.error?.message;
    return typeof message === 'string' && message.trim()
      ? message
      : fallback;
  }
}
