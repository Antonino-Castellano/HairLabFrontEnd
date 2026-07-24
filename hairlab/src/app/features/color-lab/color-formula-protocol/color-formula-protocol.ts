import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ColorFormulaDetail } from '../../../models/color-formula-management';
import {
  ColorFormulaProtocol,
  ColorFormulaProtocolRequest,
  ColorFormulaProtocolStepRequest,
  ColorFormulaProtocolStepType,
  ColorFormulaZoneIngredientRequest,
  ColorFormulaZoneRequest,
  ColorFormulaZoneType
} from '../../../models/color-formula-protocol';
import { HairDye } from '../../../models/hair-dye';
import { ColorApplicationType } from '../../../models/enums/color-application-type';
import { ColorFormulaStatus } from '../../../models/enums/color-formula-status';
import { InventoryUnit } from '../../../models/enums/inventory-unit';
import { MixingRatio } from '../../../models/enums/mixing-ratio';
import { Oxygen } from '../../../models/enums/oxygen';
import { ProductType } from '../../../models/enums/product-type';

import { ColorFormulaManagementService } from '../../../service/color-formula-management-service';
import { ColorFormulaProtocolService } from '../../../service/color-formula-protocol-service';
import { HairDyeService } from '../../../service/hair-dye-service';
import {
  COLOR_APPLICATION_LABELS,
  MIXING_RATIO_LABELS,
  OXYGEN_LABELS
} from '../color-formula-display';

@Component({
  selector: 'app-color-formula-protocol',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './color-formula-protocol.html',
  styleUrl: './color-formula-protocol.css'
})
export class ColorFormulaProtocolComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly managementService = inject(ColorFormulaManagementService);
  private readonly protocolService = inject(ColorFormulaProtocolService);
  private readonly hairDyeService = inject(HairDyeService);

  protected readonly detail = signal<ColorFormulaDetail | null>(null);
  protected readonly protocol = signal<ColorFormulaProtocol | null>(null);
  protected readonly products = signal<HairDye[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected zones: ColorFormulaZoneRequest[] = [];
  protected steps: ColorFormulaProtocolStepRequest[] = [];

  protected readonly zoneTypes: ColorFormulaZoneType[] = [
    'ROOTS', 'LENGTHS', 'ENDS', 'HAIRLINE', 'PARTIAL', 'CUSTOM'
  ];

  protected readonly stepTypes: ColorFormulaProtocolStepType[] = [
    'DIAGNOSIS', 'COLOR_REMOVAL', 'PRELIGHTENING', 'PREPIGMENTATION',
    'ROOT_APPLICATION', 'LENGTHS_APPLICATION', 'TONING', 'GLOSS',
    'REEVALUATION', 'TREATMENT', 'CUSTOM'
  ];

  protected readonly applications = Object.values(ColorApplicationType);
  protected readonly oxygens = Object.values(Oxygen);
  protected readonly ratios = Object.values(MixingRatio);
  protected readonly customMixingRatio = MixingRatio.CUSTOM;

  protected readonly oxygenLabels = OXYGEN_LABELS;
  protected readonly ratioLabels = MIXING_RATIO_LABELS;
  protected readonly applicationLabels = COLOR_APPLICATION_LABELS;

  protected readonly zoneLabels: Record<ColorFormulaZoneType, string> = {
    ROOTS: 'Ricrescita',
    LENGTHS: 'Lunghezze',
    ENDS: 'Punte',
    HAIRLINE: 'Contorno / attaccatura',
    PARTIAL: 'Zona parziale',
    CUSTOM: 'Personalizzata'
  };

  protected readonly stepLabels: Record<ColorFormulaProtocolStepType, string> = {
    DIAGNOSIS: 'Diagnosi / controllo iniziale',
    COLOR_REMOVAL: 'Rimozione colore / decapaggio',
    PRELIGHTENING: 'Pre-schiaritura',
    PREPIGMENTATION: 'Pre-pigmentazione',
    ROOT_APPLICATION: 'Applicazione ricrescita',
    LENGTHS_APPLICATION: 'Applicazione lunghezze',
    TONING: 'Tonalizzazione',
    GLOSS: 'Gloss / rifinitura',
    REEVALUATION: 'Rivalutazione tecnica',
    TREATMENT: 'Trattamento finale',
    CUSTOM: 'Step personalizzato'
  };

  ngOnInit(): void {
    const formulaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!formulaId || Number.isNaN(formulaId)) {
      this.errorMessage.set('ID formula non valido.');
      return;
    }
    this.load(formulaId);
  }

  protected canEditProtocol(): boolean {
    const status = this.detail()?.formula.status;
    return status === ColorFormulaStatus.DRAFT
      || status === ColorFormulaStatus.PROPOSED;
  }

  protected get colorProducts(): HairDye[] {
    return this.products()
      .filter(item => item.active && item.productType !== ProductType.DEVELOPER)
      .sort((a, b) =>
        a.brand.localeCompare(b.brand, 'it')
        || (a.lineName ?? '').localeCompare(b.lineName ?? '', 'it')
        || a.code.localeCompare(b.code, 'it', { numeric: true })
      );
  }

  private load(formulaId: number): void {
    this.loading.set(true);
    forkJoin({
      detail: this.managementService.getById(formulaId),
      protocol: this.protocolService.getByFormulaId(formulaId),
      products: this.hairDyeService.getAll()
    }).subscribe({
      next: result => {
        this.detail.set(result.detail);
        this.protocol.set(result.protocol);
        this.products.set(result.products ?? []);
        this.zones = (result.protocol.zones ?? []).map(zone => ({
          zoneType: zone.zoneType,
          name: zone.name,
          orderIndex: zone.orderIndex,
          applicationType: zone.applicationType ?? null,
          developerVolume: zone.developerVolume,
          mixingRatio: zone.mixingRatio,
          customDeveloperRatio: zone.customDeveloperRatio ?? null,
          processingTimeMinutes: zone.processingTimeMinutes ?? null,
          notes: zone.notes ?? '',
          ingredients: zone.ingredients.map(item => ({
            hairDyeId: item.hairDyeId,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes ?? ''
          }))
        }));
        this.steps = (result.protocol.steps ?? []).map(step => ({
          orderIndex: step.orderIndex,
          stepType: step.stepType,
          title: step.title,
          description: step.description ?? '',
          requiresReevaluation: step.requiresReevaluation,
          blocksNextStepUntilReevaluation: step.blocksNextStepUntilReevaluation,
          estimatedMinutes: step.estimatedMinutes ?? null,
          notes: step.notes ?? ''
        }));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Impossibile caricare il protocollo.'));
      }
    });
  }

  protected addZone(type: ColorFormulaZoneType = 'ROOTS'): void {
    this.zones.push({
      zoneType: type,
      name: this.zoneLabels[type],
      orderIndex: this.zones.length + 1,
      applicationType: null,
      developerVolume: Oxygen.VOL_6,
      mixingRatio: MixingRatio.RATIO_1_TO_1,
      customDeveloperRatio: null,
      processingTimeMinutes: null,
      notes: '',
      ingredients: []
    });
  }

  protected importCurrentFormulaAsSingleZone(): void {
    const current = this.detail();
    if (!current) return;

    const zoneType: ColorFormulaZoneType =
      current.formula.applicationType === ColorApplicationType.ROOT_REGROWTH
        ? 'ROOTS'
        : current.formula.applicationType === ColorApplicationType.LENGTHS_AND_ENDS
          ? 'LENGTHS'
          : 'CUSTOM';

    this.zones = [{
      zoneType,
      name: this.zoneLabels[zoneType] === 'Personalizzata'
        ? 'Formula base'
        : this.zoneLabels[zoneType],
      orderIndex: 1,
      applicationType: current.formula.applicationType ?? null,
      developerVolume: current.formula.volumeDeveloper,
      mixingRatio: current.formula.mixingRatio,
      customDeveloperRatio: current.formula.customDeveloperRatio ?? null,
      processingTimeMinutes: current.formula.recommendedProcessingTimeMinutes ?? null,
      notes: 'Importata dalla composizione corrente della formula.',
      ingredients: current.ingredients.map(item => ({
        hairDyeId: item.hairDyeId,
        quantity: Number(item.quantity),
        unit: InventoryUnit.GRAM,
        notes: item.notes ?? ''
      }))
    }];

    this.successMessage.set(
      'Composizione corrente importata come zona unica. Ora puoi dividerla in più zone senza perdere la formula di partenza.'
    );
  }

  protected addRootsLengthsTemplate(): void {
    this.zones = [];
    this.addZone('ROOTS');
    this.addZone('LENGTHS');
    this.successMessage.set('Template Ricrescita + Lunghezze creato. Completa prodotti, developer e tempi.');
  }

  protected removeZone(index: number): void {
    this.zones.splice(index, 1);
    this.reindexZones();
  }

  protected moveZone(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.zones.length) return;
    [this.zones[index], this.zones[target]] = [this.zones[target], this.zones[index]];
    this.reindexZones();
  }

  protected addIngredient(zoneIndex: number): void {
    const first = this.colorProducts[0];
    if (!first?.id) {
      this.errorMessage.set('Non ci sono prodotti colore attivi disponibili.');
      return;
    }
    this.zones[zoneIndex].ingredients.push({
      hairDyeId: first.id,
      quantity: 10,
      unit: InventoryUnit.GRAM,
      notes: ''
    });
  }

  protected removeIngredient(zoneIndex: number, ingredientIndex: number): void {
    this.zones[zoneIndex].ingredients.splice(ingredientIndex, 1);
  }

  protected addStep(type: ColorFormulaProtocolStepType = 'DIAGNOSIS'): void {
    this.steps.push({
      orderIndex: this.steps.length + 1,
      stepType: type,
      title: this.stepLabels[type],
      description: '',
      requiresReevaluation: type === 'REEVALUATION',
      blocksNextStepUntilReevaluation: false,
      estimatedMinutes: null,
      notes: ''
    });
  }

  protected addTransformationTemplate(): void {
    this.steps = [
      {
        orderIndex: 1,
        stepType: 'DIAGNOSIS',
        title: 'Conferma diagnosi e test preliminari',
        description: 'Verificare base reale, storico chimico, elasticità e compatibilità prima della trasformazione.',
        requiresReevaluation: false,
        blocksNextStepUntilReevaluation: false,
        estimatedMinutes: 10,
        notes: ''
      },
      {
        orderIndex: 2,
        stepType: 'PRELIGHTENING',
        title: 'Preparazione / pre-schiaritura controllata',
        description: 'Eseguire solo se necessaria al target. Non forzare il livello obiettivo in un unico passaggio.',
        requiresReevaluation: true,
        blocksNextStepUntilReevaluation: true,
        estimatedMinutes: null,
        notes: ''
      },
      {
        orderIndex: 3,
        stepType: 'REEVALUATION',
        title: 'Rivalutazione del fondo raggiunto',
        description: 'Registrare il livello/fondo reale ottenuto prima di decidere la formula successiva.',
        requiresReevaluation: true,
        blocksNextStepUntilReevaluation: false,
        estimatedMinutes: 10,
        notes: ''
      },
      {
        orderIndex: 4,
        stepType: 'TONING',
        title: 'Formula target / tonalizzazione',
        description: 'Applicare la formula solo sul fondo realmente ottenuto e rivalutato.',
        requiresReevaluation: false,
        blocksNextStepUntilReevaluation: false,
        estimatedMinutes: null,
        notes: ''
      }
    ];
  }

  protected removeStep(index: number): void {
    this.steps.splice(index, 1);
    this.reindexSteps();
  }

  protected moveStep(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.steps.length) return;
    [this.steps[index], this.steps[target]] = [this.steps[target], this.steps[index]];
    this.reindexSteps();
  }

  protected save(): void {
    const formulaId = this.detail()?.formula.id;
    if (!formulaId || this.saving()) return;

    this.reindexZones();
    this.reindexSteps();
    this.errorMessage.set('');
    this.successMessage.set('');

    for (const zone of this.zones) {
      if (!zone.name.trim()) {
        this.errorMessage.set('Ogni zona deve avere un nome.');
        return;
      }
      if (zone.ingredients.length === 0) {
        this.errorMessage.set(`La zona "${zone.name}" deve contenere almeno un ingrediente.`);
        return;
      }
      if (zone.ingredients.some(item => !item.hairDyeId || Number(item.quantity) <= 0)) {
        this.errorMessage.set(`Controlla prodotti e quantità della zona "${zone.name}".`);
        return;
      }
    }

    const request: ColorFormulaProtocolRequest = {
      zones: this.zones.map((zone): ColorFormulaZoneRequest => ({
        zoneType: zone.zoneType,
        name: zone.name.trim(),
        orderIndex: zone.orderIndex,
        applicationType: zone.applicationType ?? null,
        developerVolume: zone.developerVolume,
        mixingRatio: zone.mixingRatio,
        customDeveloperRatio:
          zone.mixingRatio === MixingRatio.CUSTOM
            ? Number(zone.customDeveloperRatio)
            : null,
        processingTimeMinutes:
          zone.processingTimeMinutes != null
            ? Number(zone.processingTimeMinutes)
            : null,
        notes: zone.notes?.trim() || undefined,
        ingredients: zone.ingredients.map(
          (item): ColorFormulaZoneIngredientRequest => ({
            hairDyeId: item.hairDyeId,
            quantity: Number(item.quantity),
            unit: InventoryUnit.GRAM,
            notes: item.notes?.trim() || undefined
          })
        )
      })),
      steps: this.steps.map((step): ColorFormulaProtocolStepRequest => ({
        orderIndex: step.orderIndex,
        stepType: step.stepType,
        title: step.title.trim(),
        description: step.description?.trim() || undefined,
        requiresReevaluation: step.requiresReevaluation,
        blocksNextStepUntilReevaluation:
          step.blocksNextStepUntilReevaluation,
        estimatedMinutes:
          step.estimatedMinutes != null
            ? Number(step.estimatedMinutes)
            : null,
        notes: step.notes?.trim() || undefined
      }))
    };

    this.saving.set(true);
    this.protocolService.save(formulaId, request).subscribe({
      next: (protocol: ColorFormulaProtocol) => {
        this.protocol.set(protocol);
        this.saving.set(false);
        this.successMessage.set(
          protocol.compatibility.valid
            ? 'Protocollo salvato e validato correttamente.'
            : 'Protocollo salvato, ma contiene incompatibilità da risolvere prima dell’utilizzo.'
        );
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(this.getErrorMessage(error, 'Impossibile salvare il protocollo.'));
      }
    });
  }

  protected getProductLabel(id: number): string {
    const product = this.products().find(item => item.id === id);
    return product
      ? `${product.brand} · ${product.lineName ?? 'Linea n/d'} · ${product.code} · ${product.name}`
      : `Prodotto #${id}`;
  }

  private reindexZones(): void {
    this.zones.forEach((zone, index) => zone.orderIndex = index + 1);
  }

  private reindexSteps(): void {
    this.steps.forEach((step, index) => step.orderIndex = index + 1);
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body?.message) return body.message;
    return fallback;
  }
}
