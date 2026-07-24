import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ColorFormulaDetail } from '../../../models/color-formula-management';
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
import { InventoryUnit } from '../../../models/enums/inventory-unit';
import { ProductType } from '../../../models/enums/product-type';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';

import { ColorFormulaManagementService } from '../../../service/color-formula-management-service';
import { ColorFormulaResultService } from '../../../service/color-formula-result-service';
import { ColorFormulaUsageService } from '../../../service/color-formula-usage-service';
import { CustomerService } from '../../../service/customer-service';
import { HairDyeInventoryService } from '../../../service/hair-dye-inventory-service';
import { HairDyeService } from '../../../service/hair-dye-service';

import {
  COLOR_APPLICATION_LABELS,
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
  private readonly usageService = inject(ColorFormulaUsageService);
  private readonly resultService = inject(ColorFormulaResultService);
  private readonly customerService = inject(CustomerService);
  private readonly hairDyeService = inject(HairDyeService);
  private readonly inventoryService = inject(HairDyeInventoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly detail = signal<ColorFormulaDetail | null>(null);
  protected readonly usage = signal<ColorFormulaUsage | null>(null);
  protected readonly formulaResult =
    signal<ColorFormulaResult | null>(null);

  protected readonly savingResult =
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
      customers: this.customerService.getAll(),
      products: this.hairDyeService.getAll(),
      inventories: this.inventoryService.getAll()
    }).subscribe({
      next: result => {
        this.detail.set(result.detail);
        this.customers.set(result.customers ?? []);
        this.products.set(result.products ?? []);
        this.inventories.set(result.inventories ?? []);
        this.autoSelectDeveloper();
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

  protected canEditFormula(): boolean {
    const status = this.detail()?.formula.status;
    return status === ColorFormulaStatus.DRAFT
      || status === ColorFormulaStatus.PROPOSED;
  }

  protected canUseFormula(): boolean {
    if (!this.canEditFormula() || this.usingFormula()) return false;
    if (!this.areIngredientStocksSufficient()) return false;

    const developerId = this.selectedDeveloperId();
    if (!developerId) return false;

    const developer = this.products().find(item => item.id === developerId);
    return !!developer && this.isDeveloperStockSufficient(developer);
  }

  protected useFormula(): void {
    const current = this.detail();
    const developerId = this.selectedDeveloperId();

    if (!current?.formula.id || !developerId) {
      this.errorMessage.set('Seleziona un developer valido.');
      return;
    }

    if (!this.canUseFormula()) {
      this.errorMessage.set(
        'La formula non può essere utilizzata: verifica ingredienti e developer in magazzino.'
      );
      return;
    }

    const confirmed = window.confirm(
      'Confermi l’utilizzo reale della formula?\n\n'
      + 'HairLab scaricherà definitivamente ingredienti e developer dal magazzino '
      + 'e imposterà la formula come UTILIZZATA.'
    );

    if (!confirmed) return;

    this.usingFormula.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usageService.useFormula(
      current.formula.id,
      { developerHairDyeId: developerId }
    ).subscribe({
      next: usage => {
        this.usage.set(usage);
        this.usingFormula.set(false);
        this.successMessage.set(
          'Formula utilizzata correttamente. Il magazzino è stato aggiornato.'
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
