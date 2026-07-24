import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Customer } from '../../../models/customer';
import { CustomerService } from '../../../service/customer-service';
import { CustomerColorFormulaHistoryComponent } from '../customer-color-formula-history/customer-color-formula-history';

@Component({
  selector: 'app-customer-color-formula-history-page',
  standalone: true,
  imports: [RouterLink, CustomerColorFormulaHistoryComponent],
  templateUrl: './customer-color-formula-history-page.html',
  styleUrl: './customer-color-formula-history-page.css'
})
export class CustomerColorFormulaHistoryPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);

  protected readonly customer = signal<Customer | null>(null);
  protected readonly customerId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Cliente non valido.');
      this.loading.set(false);
      return;
    }

    this.customerId.set(id);

    this.customerService.getById(id).subscribe({
      next: customer => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare il cliente.');
        this.loading.set(false);
      }
    });
  }
}
