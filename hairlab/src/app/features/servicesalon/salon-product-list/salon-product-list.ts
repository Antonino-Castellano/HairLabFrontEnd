import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalonProduct } from '../../../models/salon-product';
import { ProductCategory } from '../../../models/product-category';
import { SalonProductService } from '../../../service/salon-product-service';
import { ProductCategoryService } from '../../../service/product-category-service'; // Verifica che il path di questo import sia corretto

@Component({
  selector: 'app-salon-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './salon-product-list.html',
  styleUrl: './salon-product-list.css'
})
export class SalonProductListComponent implements OnInit {

  private readonly salonProductService = inject(SalonProductService);
  private readonly productCategoryService = inject(ProductCategoryService);

  // Stato e Signal richiesti dal template HTML
  products = signal<SalonProduct[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filtri selezionati
  selectedCategoryId = signal<string>('ALL');
  selectedStatus = signal<string>('ALL');

  // Computed signal per la lista filtrata richiesta nel template (@for (product of filteredProducts()))
  filteredProducts = computed(() => {
    return this.products().filter(product => {
      // Filtro per Categoria
      const matchesCategory = this.selectedCategoryId() === 'ALL' ||
        product.productCategoryId === Number(this.selectedCategoryId());

      // Filtro per Stato (Attivo / Inattivo)
      const matchesStatus = this.selectedStatus() === 'ALL' ||
        (this.selectedStatus() === 'ACTIVE' && product.active) ||
        (this.selectedStatus() === 'INACTIVE' && !product.active);

      return matchesCategory && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Caricamento categorie
    this.productCategoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Errore durante il caricamento delle categorie:', err)
    });

    // Caricamento prodotti
    this.salonProductService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei servizi:', err);
        this.errorMessage.set('Impossibile caricare il listino dei servizi.');
        this.loading.set(false);
      }
    });
  }

  // Gestione evento cambio Categoria dal menu a tendina
  onCategoryFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategoryId.set(selectElement.value);
  }

  // Gestione evento cambio Stato dal menu a tendina
  onStatusFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedStatus.set(selectElement.value);
  }

  // Mappa l'ID della categoria al nome visualizzato nella tabella
  getCategoryName(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat ? cat.name : 'N/D';
  }

  // Alterna lo stato tra attivo e disattivo (risponde sia a toggleStatus che a toggleActiveStatus)
  toggleStatus(product: SalonProduct): void {
    if (!product.id) return;

    if (product.active) {
      this.salonProductService.deactivate(product.id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Errore durante la disattivazione del servizio')
      });
    } else {
      this.salonProductService.activate(product.id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Impossibile riattivare il servizio. Controlla la categoria.')
      });
    }
  }

  // Cancellazione permanente tramite delete()
  deleteProduct(product: SalonProduct): void {
    if (!product.id) return;

    const confirmMsg = `Sei sicuro di voler eliminare DEFINITIVAMENTE il servizio "${product.name}"? L'azione è irreversibile.`;

    if (confirm(confirmMsg)) {
      this.salonProductService.delete(product.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Errore durante l\'eliminazione:', err);
          alert('Impossibile eliminare il servizio. Potrebbe essere già associato ad appuntamenti esistenti.');
        }
      });
    }
  }
}