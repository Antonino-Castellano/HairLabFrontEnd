import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ColorProductLineProfile } from '../../../models/color-product-line-profile';
import { ColorProductLineProfileService } from '../../../service/color-product-line-profile-service';
import { MIXING_RATIO_LABELS, OXYGEN_LABELS } from '../color-formula-display';

@Component({
  selector: 'app-color-product-line-profile-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './color-product-line-profile-list.html',
  styleUrl: './color-product-line-profile-list.css'
})
export class ColorProductLineProfileListComponent implements OnInit {

  private readonly service = inject(ColorProductLineProfileService);

  protected readonly profiles = signal<ColorProductLineProfile[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly search = signal('');

  protected readonly mixingRatioLabels = MIXING_RATIO_LABELS;
  protected readonly oxygenLabels = OXYGEN_LABELS;

  protected readonly filteredProfiles = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) return this.profiles();

    return this.profiles().filter(profile =>
      `${profile.brand} ${profile.lineName} ${profile.technicalNotes ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll().subscribe({
      next: profiles => {
        this.profiles.set(profiles ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile caricare i profili di linea.'
        );
      }
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected toggleActive(profile: ColorProductLineProfile): void {
    if (!profile.id) return;

    if (profile.active) {
      this.service.deactivate(profile.id).subscribe({
        next: () => this.load(),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message ?? 'Impossibile disattivare il profilo.'
          );
        }
      });
      return;
    }

    this.service.activate(profile.id).subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile riattivare il profilo.'
        );
      }
    });
  }

  protected getDeveloperLabel(
    profile: ColorProductLineProfile
  ): string {

    if (!profile.allowedDeveloperVolumes?.length) {
      return 'Non configurati';
    }

    return profile.allowedDeveloperVolumes
      .map(oxygen => this.oxygenLabels[oxygen])
      .join(' · ');
  }
}
