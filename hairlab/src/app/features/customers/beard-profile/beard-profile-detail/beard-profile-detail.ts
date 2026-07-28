import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeardProfile } from '../../../../models/beard-profile';
import { BeardProfileService } from '../../../../service/beard-profile-service';
import { hairLabTechnicalLabel } from '../../../../shared/ui/hairlab-technical-labels';

@Component({
  selector: 'app-beard-profile-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './beard-profile-detail.html',
  styleUrl: './beard-profile-detail.css',
})
export class BeardProfileDetailComponent implements OnChanges {
  private readonly service = inject(BeardProfileService);

  @Input({ required: true }) customerId!: number;

  protected readonly profile = signal<BeardProfile | null>(null);
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);
  protected readonly errorMessage = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId) this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.errorMessage.set('');
    this.service.getByCustomerId(this.customerId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.profile.set(null);
        if (error.status === 404) this.notFound.set(true);
        else this.errorMessage.set('Impossibile caricare il Profilo barba.');
      },
    });
  }

  protected label(value?: string | null): string {
    return hairLabTechnicalLabel(value);
  }
}
