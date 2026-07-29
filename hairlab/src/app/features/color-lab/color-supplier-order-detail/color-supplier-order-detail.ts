import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ColorSupplierOrder, ColorSupplierOrderStatus } from '../../../models/color-supplier-order';
import { ColorSupplierOrderService } from '../../../service/color-supplier-order-service';
import { INVENTORY_UNIT_LABELS } from '../color-lab-display';

@Component({
  selector: 'app-color-supplier-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './color-supplier-order-detail.html',
  styleUrl: './color-supplier-order-detail.css',
})
export class ColorSupplierOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ColorSupplierOrderService);

  protected readonly order = signal<ColorSupplierOrder | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly busy = signal(false);
  protected readonly quantities = signal<Record<number, number>>({});
  protected readonly unitPrices = signal<Record<number, number>>({});
  protected readonly savingPriceId = signal<number | null>(null);
  protected readonly notes = signal('');
  protected readonly unitLabels = INVENTORY_UNIT_LABELS;

  protected readonly labels: Record<ColorSupplierOrderStatus, string> = {
    DRAFT: 'Bozza',
    ORDERED: 'Ordinato',
    PARTIALLY_RECEIVED: 'Ricezione parziale',
    RECEIVED: 'Ricevuto',
    CANCELLED: 'Annullato',
  };

  protected readonly canReceive = computed(() =>
    ['ORDERED', 'PARTIALLY_RECEIVED'].includes(this.order()?.status ?? ''),
  );
  protected readonly canEditCosts = computed(() =>
    ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(this.order()?.status ?? ''),
  );
  protected readonly committedTotal = computed(() =>
    (this.order()?.items ?? []).reduce((total, item) => total + (item.lineTotal ?? 0), 0),
  );
  protected readonly receivedTotal = computed(() =>
    (this.order()?.items ?? []).reduce(
      (total, item) => total + item.receivedQuantity * (item.unitPrice ?? 0),
      0,
    ),
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) this.load(id);
  }

  protected ordered(): void {
    const order = this.order();
    if (!order) return;
    this.service.markOrdered(order.id).subscribe({
      next: (updated) => this.syncOrder(updated),
      error: (error: HttpErrorResponse) => this.handleError(error, 'Errore aggiornamento ordine'),
    });
  }

  protected cancel(): void {
    const order = this.order();
    if (!order) return;
    this.service.cancel(order.id).subscribe({
      next: (updated) => this.syncOrder(updated),
      error: (error: HttpErrorResponse) => this.handleError(error, 'Errore annullamento ordine'),
    });
  }

  protected changeQuantity(id: number, event: Event): void {
    this.quantities.update((values) => ({
      ...values,
      [id]: Number((event.target as HTMLInputElement).value) || 0,
    }));
  }

  protected changePrice(id: number, event: Event): void {
    this.unitPrices.update((values) => ({
      ...values,
      [id]: Math.max(0, Number((event.target as HTMLInputElement).value) || 0),
    }));
  }

  protected savePrice(itemId: number): void {
    const order = this.order();
    if (!order || !this.canEditCosts()) return;
    this.savingPriceId.set(itemId);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.service.updateUnitPrice(order.id, itemId, this.unitPrices()[itemId] ?? 0).subscribe({
      next: (updated) => {
        this.syncOrder(updated);
        this.savingPriceId.set(null);
        this.successMessage.set(
          'Costo unitario salvato. Le statistiche forniture sono aggiornate.',
        );
      },
      error: (error: HttpErrorResponse) => {
        this.savingPriceId.set(null);
        this.handleError(error, 'Errore durante il salvataggio del costo');
      },
    });
  }

  protected receive(): void {
    const order = this.order();
    if (!order) return;
    const items = order.items
      .map((item) => ({
        orderItemId: item.id,
        quantity: this.quantities()[item.id] ?? 0,
      }))
      .filter((item) => item.quantity > 0);
    if (!items.length) return;

    this.busy.set(true);
    this.errorMessage.set('');
    this.service.receive(order.id, { items, notes: this.notes().trim() || null }).subscribe({
      next: (updated) => {
        this.syncOrder(updated);
        this.busy.set(false);
        this.notes.set('');
        this.successMessage.set('Ricezione registrata e magazzino aggiornato.');
      },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        this.handleError(error, 'Errore ricezione');
      },
    });
  }

  private load(id: number): void {
    this.service.getById(id).subscribe({
      next: (order) => this.syncOrder(order),
      error: (error: HttpErrorResponse) => this.handleError(error, 'Errore ordine'),
    });
  }

  private syncOrder(order: ColorSupplierOrder): void {
    this.order.set(order);
    this.quantities.set(
      Object.fromEntries(order.items.map((item) => [item.id, item.remainingQuantity])),
    );
    this.unitPrices.set(
      Object.fromEntries(order.items.map((item) => [item.id, item.unitPrice ?? 0])),
    );
  }

  private handleError(error: HttpErrorResponse, fallback: string): void {
    this.errorMessage.set(error.error?.message ?? fallback);
  }
}
