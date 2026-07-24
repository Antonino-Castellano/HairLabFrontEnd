import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HairDye } from '../../../models/hair-dye';
import { ColorProductLineProfile } from '../../../models/color-product-line-profile';
import { ProductType } from '../../../models/enums/product-type';
import { MixingRatio } from '../../../models/enums/mixing-ratio';
import { Oxygen } from '../../../models/enums/oxygen';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';
import { HairDyeService } from '../../../service/hair-dye-service';
import { ColorProductLineProfileService } from '../../../service/color-product-line-profile-service';
import {
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

/** Form di creazione e modifica del catalogo tecnico Color Lab. */
@Component({
  selector: 'app-hair-dye-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './hair-dye-form.html',
  styleUrl: './hair-dye-form.css'
})
export class HairDyeFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hairDyeService = inject(HairDyeService);
  private readonly lineProfileService = inject(ColorProductLineProfileService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly lineProfiles = signal<ColorProductLineProfile[]>([]);
  protected readonly isEditMode = signal(false);
  protected productId?: number;

  protected readonly productTypes = Object.values(ProductType);
  protected readonly oxygens = Object.values(Oxygen);
  protected readonly mixingRatios = Object.values(MixingRatio);
  protected readonly toneLevels = Object.values(ToneLevel);
  protected readonly reflections = Object.values(Reflection);

  protected readonly productTypeLabels = PRODUCT_TYPE_LABELS;
  protected readonly oxygenLabels = OXYGEN_LABELS;
  protected readonly mixingRatioLabels = MIXING_RATIO_LABELS;
  protected readonly toneLevelLabels = TONE_LEVEL_LABELS;
  protected readonly toneLevelColors = TONE_LEVEL_COLORS;
  protected readonly reflectionLabels = REFLECTION_LABELS;
  protected readonly reflectionColors = REFLECTION_COLORS;

  protected readonly form = this.formBuilder.group({
    brand: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    lineName: ['', [Validators.maxLength(150)]],
    code: ['', [Validators.required, Validators.maxLength(80)]],
    productType: [ProductType.COLOR, Validators.required],
    developerVolume: [null as Oxygen | null],
    toneLevel: [null as ToneLevel | null],
    primaryReflection: [null as Reflection | null],
    secondaryReflection: [null as Reflection | null],

    defaultMixingRatio: [
      null as
        MixingRatio |
        null
    ],

    customMixingRatioMultiplier: [
      null as
        number |
        null
    ],

    allowedDeveloperVolumes: [
      [] as Oxygen[]
    ],

    maxLiftLevels: [
      null as
        number |
        null
    ],

    depositOnly: [
      false
    ],

    technicalNotes: [
      '',
      [
        Validators.maxLength(
          4000
        )
      ]
    ],

    useLineProfileRules: [false],

    active: [true, Validators.required]
  });

  ngOnInit(): void {
    this.loadLineProfiles();

    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage.set('ID prodotto non valido.');
      return;
    }

    this.productId = id;
    this.isEditMode.set(true);
    this.loadProduct(id);
  }

  private loadLineProfiles(): void {

    this.lineProfileService
      .getActive()
      .subscribe({
        next: profiles => {
          this.lineProfiles.set(profiles ?? []);
        },
        error: () => {
          this.lineProfiles.set([]);
        }
      });
  }

  protected getMatchingLineProfile():
    ColorProductLineProfile | undefined {

    const brand =
      this.form.controls.brand.value?.trim().toLowerCase();

    const lineName =
      this.form.controls.lineName.value?.trim().toLowerCase();

    if (!brand || !lineName) {
      return undefined;
    }

    return this.lineProfiles().find(
      profile =>
        profile.brand.trim().toLowerCase() === brand
        &&
        profile.lineName.trim().toLowerCase() === lineName
    );
  }

  protected getSelectedLineProfileId(): string {
    return this.getMatchingLineProfile()?.id?.toString() ?? '';
  }

  protected onLineProfileChange(event: Event): void {

    const id = Number(
      (event.target as HTMLSelectElement).value
    );

    const profile =
      this.lineProfiles().find(item => item.id === id);

    if (!profile) {
      this.form.controls.useLineProfileRules.setValue(false);
      return;
    }

    this.form.patchValue({
      brand: profile.brand,
      lineName: profile.lineName,
      useLineProfileRules:
        this.supportsTechnicalRules()
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);

    this.hairDyeService.getById(id).subscribe({
      next: product => {
        this.form.patchValue({
          brand: product.brand,
          name: product.name,
          lineName: product.lineName ?? '',
          code: product.code,
          productType: product.productType,
          developerVolume: product.developerVolume ?? null,
          toneLevel: product.toneLevel ?? null,
          primaryReflection: product.primaryReflection ?? null,
          secondaryReflection: product.secondaryReflection ?? null,
          defaultMixingRatio:
            product.defaultMixingRatio ??
            null,
          customMixingRatioMultiplier:
            product.customMixingRatioMultiplier ??
            null,
          allowedDeveloperVolumes:
            product.allowedDeveloperVolumes ??
            [],
          maxLiftLevels:
            product.maxLiftLevels ??
            null,
          depositOnly:
            product.depositOnly ??
            false,
          technicalNotes:
            product.technicalNotes ??
            '',
          useLineProfileRules:
            product.useLineProfileRules ??
            false,
          active: product.active
        });
        this.updateDeveloperValidation();
        this.updateTechnicalRuleValidation();
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare il prodotto.')
        );
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const product: HairDye = {
      brand: value.brand?.trim() ?? '',
      name: value.name?.trim() ?? '',
      lineName:
        value.lineName?.trim() ||
        null,
      code: value.code?.trim() ?? '',
      productType: value.productType ?? ProductType.COLOR,
      developerVolume:
        value.productType === ProductType.DEVELOPER
          ? (value.developerVolume ?? null)
          : null,
      toneLevel: value.toneLevel ?? undefined,
      primaryReflection: value.primaryReflection ?? undefined,
      secondaryReflection: value.secondaryReflection ?? undefined,

      defaultMixingRatio:
        this.supportsTechnicalRules()
          ? (
              value.defaultMixingRatio ??
              null
            )
          : null,

      customMixingRatioMultiplier:
        this.supportsTechnicalRules()
        &&
        value.defaultMixingRatio ===
          MixingRatio.CUSTOM

          ? (
              value.customMixingRatioMultiplier ??
              null
            )

          : null,

      allowedDeveloperVolumes:
        this.supportsTechnicalRules()
          ? (
              value.allowedDeveloperVolumes ??
              []
            )
          : [],

      maxLiftLevels:
        this.supportsTechnicalRules()
          ? (
              value.maxLiftLevels ??
              null
            )
          : null,

      depositOnly:
        this.supportsTechnicalRules()
          ? (
              value.depositOnly ??
              false
            )
          : false,

      technicalNotes:
        value.technicalNotes?.trim() ||
        null,

      useLineProfileRules:
        value.useLineProfileRules ??
        false,

      active: value.active ?? true
    };

    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode() && this.productId) {
      this.hairDyeService.update(this.productId, product).subscribe({
        next: () => this.goBack(),
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            this.getErrorMessage(error, 'Impossibile modificare il prodotto.')
          );
        }
      });
      return;
    }

    this.hairDyeService.insert(product).subscribe({
      next: () => this.goBack(),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile creare il prodotto.')
        );
      }
    });
  }


  protected isDeveloper(): boolean {
    return this.form.controls.productType.value === ProductType.DEVELOPER;
  }

  protected onProductTypeChange(): void {
    this.updateDeveloperValidation();
    this.updateTechnicalRuleValidation();
  }

  private updateDeveloperValidation(): void {
    const control = this.form.controls.developerVolume;

    if (this.isDeveloper()) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setValue(null);
    }

    control.updateValueAndValidity();
  }

  /**
   * Le regole di rapporto/developer/lift
   * si applicano ai prodotti che partecipano
   * direttamente a una miscela tecnica.
   */
  protected supportsTechnicalRules():
    boolean {

    const type =
      this.form.controls
        .productType
        .value;

    return (
      type ===
        ProductType.COLOR
      ||
      type ===
        ProductType.TONER
      ||
      type ===
        ProductType.BLEACH
    );
  }

  protected isCustomMixingRatio():
    boolean {

    return (
      this.form.controls
        .defaultMixingRatio
        .value ===
      MixingRatio.CUSTOM
    );
  }

  protected onMixingRatioChange():
    void {

    this.updateTechnicalRuleValidation();
  }

  protected isAllowedDeveloper(
    oxygen:
      Oxygen
  ): boolean {

    return (
      this.form.controls
        .allowedDeveloperVolumes
        .value ??
      []
    ).includes(
      oxygen
    );
  }

  protected toggleAllowedDeveloper(
    oxygen:
      Oxygen,
    checked:
      boolean
  ): void {

    const current =
      new Set(
        this.form.controls
          .allowedDeveloperVolumes
          .value ??
        []
      );

    if (
      checked
    ) {

      current.add(
        oxygen
      );

    } else {

      current.delete(
        oxygen
      );
    }

    this.form.controls
      .allowedDeveloperVolumes
      .setValue(
        Array.from(
          current
        )
      );
  }

  protected onAllowedDeveloperToggle(
    oxygen:
      Oxygen,
    event:
      Event
  ): void {

    this.toggleAllowedDeveloper(
      oxygen,
      (
        event.target as
          HTMLInputElement
      ).checked
    );
  }

  private updateTechnicalRuleValidation():
    void {

    const customControl =
      this.form.controls
        .customMixingRatioMultiplier;

    if (
      this.supportsTechnicalRules()
      &&
      this.isCustomMixingRatio()
    ) {

      customControl.setValidators([
        Validators.required,
        Validators.min(
          0.01
        )
      ]);

    } else {

      customControl.clearValidators();

      if (
        !this.isCustomMixingRatio()
      ) {

        customControl.setValue(
          null
        );
      }
    }

    if (
      !this.supportsTechnicalRules()
    ) {

      this.form.patchValue({

        defaultMixingRatio:
          null,

        customMixingRatioMultiplier:
          null,

        allowedDeveloperVolumes:
          [],

        maxLiftLevels:
          null,

        depositOnly:
          false,

        useLineProfileRules:
          false
      });
    }

    customControl
      .updateValueAndValidity({
        emitEvent:
          false
      });
  }

  protected clearToneData(): void {
    this.form.patchValue({
      toneLevel: null,
      primaryReflection: null,
      secondaryReflection: null
    });
  }

  private goBack(): void {
    this.router.navigate(['/color-lab'], {
      queryParams: { tab: 'library' }
    });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const message = error.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
