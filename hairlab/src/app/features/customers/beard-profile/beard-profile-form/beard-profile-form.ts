import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BeardColorGoal,
  BeardDensity,
  BeardGrowthPattern,
  BeardLength,
  BeardLine,
  BeardProfile,
  BeardStyle,
  MoustacheConnection,
  MoustacheStyle,
  SkinSensitivity,
} from '../../../../models/beard-profile';
import { BeardProfileService } from '../../../../service/beard-profile-service';
import { hairLabTechnicalLabel } from '../../../../shared/ui/hairlab-technical-labels';

@Component({
  selector: 'app-beard-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './beard-profile-form.html',
  styleUrl: './beard-profile-form.css',
})
export class BeardProfileFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BeardProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected customerId = 0;
  protected profileId?: number;
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly styles: BeardStyle[] = [
    'CLEAN_SHAVEN',
    'STUBBLE',
    'SHORT_BOXED',
    'FULL_BEARD',
    'LONG_BEARD',
    'GOATEE',
    'CIRCLE_BEARD',
    'VAN_DYKE',
    'BALBO',
    'ANCHOR',
    'CHIN_STRAP',
    'DUCKTAIL',
    'GARIBALDI',
    'MOUSTACHE_ONLY',
    'BEARD_AND_MOUSTACHE',
    'CUSTOM',
  ];
  protected readonly lengths: BeardLength[] = [
    'SHAVED',
    'VERY_SHORT',
    'SHORT',
    'MEDIUM',
    'LONG',
    'VERY_LONG',
  ];
  protected readonly densities: BeardDensity[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  protected readonly growthPatterns: BeardGrowthPattern[] = [
    'UNIFORM',
    'PATCHY_CHEEKS',
    'PATCHY_CHIN',
    'PATCHY_SIDES',
    'STRONG_CHIN',
    'STRONG_MOUSTACHE',
    'DISCONNECTED_MOUSTACHE',
    'IRREGULAR',
  ];
  protected readonly moustacheStyles: MoustacheStyle[] = [
    'NONE',
    'NATURAL',
    'SHORT',
    'PENCIL',
    'CHEVRON',
    'HANDLEBAR',
    'HORSESHOE',
    'WALRUS',
    'DISCONNECTED',
    'CUSTOM',
  ];
  protected readonly connections: MoustacheConnection[] = [
    'CONNECTED',
    'PARTIALLY_CONNECTED',
    'DISCONNECTED',
  ];
  protected readonly lines: BeardLine[] = ['NATURAL', 'HIGH', 'MEDIUM', 'LOW', 'DEFINED'];
  protected readonly sensitivities: SkinSensitivity[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];
  protected readonly colorGoals: BeardColorGoal[] = [
    'NONE',
    'FULL_COVERAGE',
    'GRAY_BLENDING',
    'CAMOUFLAGE',
    'DARKENING',
    'TONING',
    'COLOR_MATCH_WITH_HAIR',
  ];

  protected readonly form = this.fb.nonNullable.group({
    beardPresent: true,
    currentStyle: 'STUBBLE' as BeardStyle,
    desiredStyle: 'SHORT_BOXED' as BeardStyle,
    beardLength: 'SHORT' as BeardLength,
    approximateLengthMm: [8, [Validators.min(0), Validators.max(500)]],
    density: 'MEDIUM' as BeardDensity,
    growthPattern: 'UNIFORM' as BeardGrowthPattern,
    moustachePresent: true,
    moustacheStyle: 'NATURAL' as MoustacheStyle,
    moustacheConnection: 'CONNECTED' as MoustacheConnection,
    cheekLine: 'DEFINED' as BeardLine,
    neckline: 'DEFINED' as BeardLine,
    skinSensitivity: 'LOW' as SkinSensitivity,
    irritationPresent: false,
    ingrownHairPresent: false,
    dandruffPresent: false,
    naturalTone: 'LEVEL_4_MEDIUM_BROWN',
    grayPercentage: [0, [Validators.min(0), Validators.max(100)]],
    beardColoringPresent: false,
    beardColorGoal: 'NONE' as BeardColorGoal,
    beardColorHistory: '',
    contraindications: '',
    notes: '',
  });

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('customerId'));
    const profileId = Number(this.route.snapshot.paramMap.get('profileId'));
    if (!this.customerId || Number.isNaN(this.customerId)) {
      this.errorMessage.set('Cliente non valido.');
      return;
    }
    if (profileId > 0) {
      this.profileId = profileId;
      this.isEditMode.set(true);
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.service.getByCustomerId(this.customerId).subscribe({
      next: (profile) => {
        this.form.patchValue({
          ...profile,
          approximateLengthMm: profile.approximateLengthMm ?? 0,
          grayPercentage: profile.grayPercentage ?? 0,
          irritationPresent: profile.irritationPresent ?? false,
          ingrownHairPresent: profile.ingrownHairPresent ?? false,
          dandruffPresent: profile.dandruffPresent ?? false,
          beardColoringPresent: profile.beardColoringPresent ?? false,
          currentStyle: profile.currentStyle ?? 'STUBBLE',
          desiredStyle: profile.desiredStyle ?? 'SHORT_BOXED',
          beardLength: profile.beardLength ?? 'SHORT',
          density: profile.density ?? 'MEDIUM',
          growthPattern: profile.growthPattern ?? 'UNIFORM',
          moustacheStyle: profile.moustacheStyle ?? 'NONE',
          moustacheConnection: profile.moustacheConnection ?? 'DISCONNECTED',
          cheekLine: profile.cheekLine ?? 'NATURAL',
          neckline: profile.neckline ?? 'NATURAL',
          skinSensitivity: profile.skinSensitivity ?? 'NONE',
          beardColorGoal: profile.beardColorGoal ?? 'NONE',
          naturalTone: profile.naturalTone ?? 'LEVEL_4_MEDIUM_BROWN',
          beardColorHistory: profile.beardColorHistory ?? '',
          contraindications: profile.contraindications ?? '',
          notes: profile.notes ?? '',
        });
        this.profileId = profile.id;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare il Profilo barba.');
        this.loading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    const payload: BeardProfile = { customerId: this.customerId, ...this.form.getRawValue() };
    const request =
      this.isEditMode() && this.profileId
        ? this.service.update(this.profileId, payload)
        : this.service.insert(payload);
    request.subscribe({
      next: () => this.router.navigate(['/customers', this.customerId]),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message ?? 'Impossibile salvare il Profilo barba.');
      },
    });
  }

  protected label(value: string): string {
    return hairLabTechnicalLabel(value);
  }
}
