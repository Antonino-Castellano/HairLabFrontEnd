import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ColorProductLineProfile } from '../../../models/color-product-line-profile';
import { MixingRatio } from '../../../models/enums/mixing-ratio';
import { Oxygen } from '../../../models/enums/oxygen';
import { ColorProductLineProfileService } from '../../../service/color-product-line-profile-service';
import { MIXING_RATIO_LABELS, OXYGEN_LABELS } from '../color-formula-display';

@Component({
  selector: 'app-color-product-line-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './color-product-line-profile-form.html',
  styleUrl: './color-product-line-profile-form.css'
})
export class ColorProductLineProfileFormComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(ColorProductLineProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isEditMode = signal(false);

  protected profileId?: number;

  protected readonly ratios = Object.values(MixingRatio);
  protected readonly oxygens = Object.values(Oxygen);

  protected readonly ratioLabels = MIXING_RATIO_LABELS;
  protected readonly oxygenLabels = OXYGEN_LABELS;

  protected readonly form = this.formBuilder.group({
    brand: ['', Validators.required],
    lineName: ['', Validators.required],
    defaultMixingRatio: [null as MixingRatio | null],
    customMixingRatioMultiplier: [null as number | null],
    allowedDeveloperVolumes: [[] as Oxygen[]],
    maxLiftLevels: [null as number | null],
    depositOnly: [false],
    allowCrossLineMixing: [false],
    requireSameLineDeveloper: [true],
    technicalNotes: [''],
    active: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('ID profilo linea non valido.');
      return;
    }

    this.profileId = id;
    this.isEditMode.set(true);
    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: profile => {
        this.form.patchValue({
          brand: profile.brand,
          lineName: profile.lineName,
          defaultMixingRatio: profile.defaultMixingRatio ?? null,
          customMixingRatioMultiplier: profile.customMixingRatioMultiplier ?? null,
          allowedDeveloperVolumes: profile.allowedDeveloperVolumes ?? [],
          maxLiftLevels: profile.maxLiftLevels ?? null,
          depositOnly: profile.depositOnly ?? false,
          allowCrossLineMixing: profile.allowCrossLineMixing,
          requireSameLineDeveloper: profile.requireSameLineDeveloper,
          technicalNotes: profile.technicalNotes ?? '',
          active: profile.active
        });

        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile caricare il profilo linea.'
        );
      }
    });
  }

  protected isCustom(): boolean {
    return this.form.controls.defaultMixingRatio.value === MixingRatio.CUSTOM;
  }

  protected isDeveloperSelected(oxygen: Oxygen): boolean {
    return (
      this.form.controls.allowedDeveloperVolumes.value ?? []
    ).includes(oxygen);
  }

  protected toggleDeveloper(
    oxygen: Oxygen,
    event: Event
  ): void {

    const checked = (event.target as HTMLInputElement).checked;

    const values = new Set(
      this.form.controls.allowedDeveloperVolumes.value ?? []
    );

    if (checked) values.add(oxygen);
    else values.delete(oxygen);

    this.form.controls.allowedDeveloperVolumes.setValue(
      Array.from(values)
    );
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const profile: ColorProductLineProfile = {
      brand: value.brand?.trim() ?? '',
      lineName: value.lineName?.trim() ?? '',
      defaultMixingRatio: value.defaultMixingRatio ?? null,
      customMixingRatioMultiplier:
        value.defaultMixingRatio === MixingRatio.CUSTOM
          ? (value.customMixingRatioMultiplier ?? null)
          : null,
      allowedDeveloperVolumes: value.allowedDeveloperVolumes ?? [],
      maxLiftLevels: value.maxLiftLevels ?? null,
      depositOnly: value.depositOnly ?? false,
      allowCrossLineMixing: value.allowCrossLineMixing ?? false,
      requireSameLineDeveloper: value.requireSameLineDeveloper ?? true,
      technicalNotes: value.technicalNotes?.trim() || null,
      active: value.active ?? true
    };

    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      this.isEditMode() && this.profileId
        ? this.service.update(this.profileId, profile)
        : this.service.insert(profile);

    request.subscribe({
      next: () => {
        this.router.navigate(['/color-lab/lines']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile salvare il profilo linea.'
        );
      }
    });
  }
}
