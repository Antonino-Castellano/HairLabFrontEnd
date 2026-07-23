import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HairDye } from '../../../models/hair-dye';
import { HairDyeInventory } from '../../../models/hair-dye-inventory';
import { InventoryUnit } from '../../../models/enums/inventory-unit';
import { ProductType } from '../../../models/enums/product-type';
import { HairDyeInventoryService } from '../../../service/hair-dye-inventory-service';
import { HairDyeService } from '../../../service/hair-dye-service';
import { INVENTORY_UNIT_LABELS, PRODUCT_TYPE_LABELS } from '../color-lab-display';

/** Form di creazione o aggiornamento della giacenza corrente. */
@Component({
  selector: 'app-hair-dye-inventory-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './hair-dye-inventory-form.html',
  styleUrl: './hair-dye-inventory-form.css'
})
export class HairDyeInventoryFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hairDyeService = inject(HairDyeService);
  private readonly inventoryService = inject(HairDyeInventoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly product = signal<HairDye | null>(null);
  protected readonly inventory = signal<HairDyeInventory | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected hairDyeId = 0;

  protected readonly units = Object.values(InventoryUnit);
  protected readonly unitLabels = INVENTORY_UNIT_LABELS;
  protected readonly productTypeLabels = PRODUCT_TYPE_LABELS;

  protected readonly form = this.formBuilder.nonNullable.group({
    quantityAvailable: [0, [Validators.required, Validators.min(0)]],
    unit: [InventoryUnit.GRAM, Validators.required],
    lowStockThreshold: [20, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('hairDyeId');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id) || id <= 0) {
      this.errorMessage.set('ID prodotto non valido.');
      return;
    }

    this.hairDyeId = id;
    this.loadProduct();
  }

  private loadProduct(): void {
    this.loading.set(true);

    this.hairDyeService.getById(this.hairDyeId).subscribe({
      next: product => {
        this.product.set(product);
        this.form.patchValue({
          unit: product.productType === ProductType.DEVELOPER
            ? InventoryUnit.MILLILITER
            : InventoryUnit.GRAM
        });
        this.loadInventory();
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare il prodotto.')
        );
      }
    });
  }

  private loadInventory(): void {
    this.inventoryService.getByHairDyeId(this.hairDyeId).subscribe({
      next: inventory => {
        this.inventory.set(inventory);
        this.form.patchValue({
          quantityAvailable: inventory.quantityAvailable,
          unit: inventory.unit,
          lowStockThreshold: inventory.lowStockThreshold
        });
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.inventory.set(null);
          this.loading.set(false);
          return;
        }
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile caricare la giacenza.')
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
    const payload: HairDyeInventory = {
      hairDyeId: this.hairDyeId,
      quantityAvailable: Number(value.quantityAvailable),
      unit: value.unit,
      lowStockThreshold: Number(value.lowStockThreshold)
    };

    this.loading.set(true);
    this.errorMessage.set('');

    const current = this.inventory();
    const request$ = current?.id
      ? this.inventoryService.update(current.id, payload)
      : this.inventoryService.insert(payload);

    request$.subscribe({
      next: () => this.goBack(),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile salvare la giacenza.')
        );
      }
    });
  }

  protected getStockPreview(): 'OK' | 'LOW' | 'OUT' {
    const quantity = Number(this.form.controls.quantityAvailable.value);
    const threshold = Number(this.form.controls.lowStockThreshold.value);
    if (quantity <= 0) return 'OUT';
    if (quantity <= threshold) return 'LOW';
    return 'OK';
  }

  protected getStockPreviewLabel(): string {
    switch (this.getStockPreview()) {
      case 'OUT': return 'Esaurito';
      case 'LOW': return 'Scorta bassa';
      default: return 'Disponibile';
    }
  }

  private goBack(): void {
    this.router.navigate(['/color-lab'], {
      queryParams: { tab: 'inventory' }
    });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const message = error.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
