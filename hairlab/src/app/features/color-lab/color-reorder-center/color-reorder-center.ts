import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ColorReorderSuggestion } from '../../../models/color-reorder';
import { ColorReorderService } from '../../../service/color-reorder-service';
import { ColorSupplierOrderService } from '../../../service/color-supplier-order-service';
import { INVENTORY_UNIT_LABELS } from '../color-lab-display';

interface ReorderGroup {
  supplierId: number | null;
  supplierName: string;
  items: ColorReorderSuggestion[];
}

@Component({
  selector: 'app-color-reorder-center',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './color-reorder-center.html',
  styleUrl: './color-reorder-center.css',
})
export class ColorReorderCenterComponent implements OnInit {
  private readonly reorderService = inject(ColorReorderService);
  private readonly orderService = inject(ColorSupplierOrderService);
  private readonly router = inject(Router);

  protected readonly suggestions = signal<ColorReorderSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly creating = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly unitLabels = INVENTORY_UNIT_LABELS;

  protected readonly groups = computed<ReorderGroup[]>(() => {
    const grouped = new Map<string, ReorderGroup>();

    for (const item of this.suggestions()) {
      const validSupplier = item.supplierConfigured && item.preferredSupplierId != null;
      const key = validSupplier
        ? String(item.preferredSupplierId)
        : `NONE-${String(item.preferredSupplierId ?? 'X')}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          supplierId: validSupplier ? item.preferredSupplierId! : null,
          supplierName: validSupplier
            ? (item.preferredSupplierName ?? 'Fornitore')
            : item.preferredSupplierName
              ? `${item.preferredSupplierName} · non attivo`
              : 'Fornitore non configurato',
          items: [],
        });
      }

      grouped.get(key)!.items.push(item);
    }

    return [...grouped.values()];
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.reorderService.getSuggestions().subscribe({
      next: suggestions => {
        this.suggestions.set(suggestions ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'Errore durante il calcolo del riordino');
      },
    });
  }

  protected create(group: ReorderGroup): void {
    if (!group.supplierId) {
      return;
    }

    this.creating.set(group.supplierId);

    this.orderService
      .createFromReorder(group.supplierId, {
        selectedHairDyeIds: group.items.map(item => item.hairDyeId),
        notes: 'Bozza generata dal Centro riordino HairLab',
      })
      .subscribe({
        next: order => this.router.navigate(['/color-lab/orders', order.id]),
        error: (error: HttpErrorResponse) => {
          this.creating.set(null);
          this.errorMessage.set(error.error?.message ?? 'Errore durante la creazione dell’ordine');
        },
      });
  }
}
