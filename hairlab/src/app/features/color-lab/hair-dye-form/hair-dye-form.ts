import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HairDye } from '../../../models/hair-dye';
import { ProductType } from '../../../models/enums/product-type';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';
import { HairDyeService } from '../../../service/hair-dye-service';
import {
  PRODUCT_TYPE_LABELS,
  REFLECTION_COLORS,
  REFLECTION_LABELS,
  TONE_LEVEL_COLORS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

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
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isEditMode = signal(false);
  protected productId?: number;

  protected readonly productTypes = Object.values(ProductType);
  protected readonly toneLevels = Object.values(ToneLevel);
  protected readonly reflections = Object.values(Reflection);

  protected readonly productTypeLabels = PRODUCT_TYPE_LABELS;
  protected readonly toneLevelLabels = TONE_LEVEL_LABELS;
  protected readonly toneLevelColors = TONE_LEVEL_COLORS;
  protected readonly reflectionLabels = REFLECTION_LABELS;
  protected readonly reflectionColors = REFLECTION_COLORS;

  protected readonly form = this.formBuilder.group({
    brand: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    code: ['', [Validators.required, Validators.maxLength(80)]],
    productType: [ProductType.COLOR, Validators.required],
    toneLevel: [null as ToneLevel | null],
    primaryReflection: [null as Reflection | null],
    secondaryReflection: [null as Reflection | null],
    active: [true, Validators.required]
  });

  ngOnInit(): void {
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

  private loadProduct(id: number): void {
    this.loading.set(true);

    this.hairDyeService.getById(id).subscribe({
      next: product => {
        this.form.patchValue({
          brand: product.brand,
          name: product.name,
          code: product.code,
          productType: product.productType,
          toneLevel: product.toneLevel ?? null,
          primaryReflection: product.primaryReflection ?? null,
          secondaryReflection: product.secondaryReflection ?? null,
          active: product.active
        });
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
      code: value.code?.trim() ?? '',
      productType: value.productType ?? ProductType.COLOR,
      toneLevel: value.toneLevel ?? undefined,
      primaryReflection: value.primaryReflection ?? undefined,
      secondaryReflection: value.secondaryReflection ?? undefined,
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
