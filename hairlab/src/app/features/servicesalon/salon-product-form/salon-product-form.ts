import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SalonProductService } from '../../../service/salon-product-service';
import { ProductCategoryService } from '../../../service/product-category-service';
import { ProductCategory } from '../../../models/product-category';
import { SalonProduct } from '../../../models/salon-product';



@Component({
  selector: 'app-salon-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './salon-product-form.html',
  styleUrl: './salon-product-form.css'
})
export class SalonProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly salonProductService = inject(SalonProductService);
  private readonly productCategoryService = inject(ProductCategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly categories = signal<ProductCategory[]>([]);
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected productId?: number;

  protected readonly productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    productCategoryId: [null as number | null, Validators.required],
    duration: [30, [Validators.required, Validators.min(1)]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    active: [true]
  });

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id) && id > 0) {
        this.productId = id;
        this.isEditMode.set(true);
        this.loadProduct(id);
      } else {
        this.errorMessage.set('ID servizio non valido.');
      }
    }
  }

  private loadCategories(): void {
    this.productCategoryService.getActive().subscribe({
      next: (categories) => this.categories.set(categories ?? []),
      error: () => this.errorMessage.set('Impossibile caricare le categorie.')
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);

    this.salonProductService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          productCategoryId: product.productCategoryId,
          duration: product.duration,
          basePrice: product.basePrice,
          description: product.description ?? '',
          active: product.active
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i dettagli del servizio.');
        this.loading.set(false);
      }
    });
  }

  protected submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue = this.productForm.getRawValue();

    const product: SalonProduct = {
      name: formValue.name.trim(),
      productCategoryId: formValue.productCategoryId!,
      duration: formValue.duration,
      basePrice: formValue.basePrice,
      description: formValue.description ? formValue.description.trim() : undefined,
      active: formValue.active
    };

    if (this.isEditMode() && this.productId !== undefined) {
      this.salonProductService.update(this.productId, product).subscribe({
        next: () => this.router.navigate(['/services']),
        error: (err: HttpErrorResponse) => this.handleError(err, 'Impossibile aggiornare il servizio.')
      });
    } else {
      this.salonProductService.insert(product).subscribe({
        next: () => this.router.navigate(['/services']),
        error: (err: HttpErrorResponse) => this.handleError(err, 'Impossibile inserire il servizio.')
      });
    }
  }

  private handleError(error: HttpErrorResponse, defaultMsg: string): void {
    this.loading.set(false);

    if (error.status === 400) {
      this.errorMessage.set('I dati inseriti non sono validi.');
    } else if (error.status === 0) {
      this.errorMessage.set('Impossibile comunicare con il backend.');
    } else {
      this.errorMessage.set(defaultMsg);
    }
  }
}