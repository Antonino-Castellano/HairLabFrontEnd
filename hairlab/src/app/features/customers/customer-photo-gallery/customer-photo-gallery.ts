import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HAIRLAB_SERVER_BASE_URL } from '../../../core/config/api.config';
import { CustomerPhoto, CustomerPhotoType } from '../../../models/customer-photo';
import { CustomerPhotoService } from '../../../service/customer-photo-service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-customer-photo-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-photo-gallery.html',
  styleUrl: './customer-photo-gallery.css',
})
export class CustomerPhotoGalleryComponent implements OnChanges {
  private readonly service = inject(CustomerPhotoService);
  private readonly toast = inject(ToastService);

  @Input({ required: true }) customerId!: number;
  @Output() sourceChanged = new EventEmitter<CustomerPhoto | null>();

  protected readonly photos = signal<CustomerPhoto[]>([]);
  protected readonly sourcePhoto = signal<CustomerPhoto | null>(null);
  protected readonly loading = signal(false);
  protected readonly uploading = signal(false);
  protected selectedFile: File | null = null;
  protected photoType: CustomerPhotoType = 'TECHNICAL';
  protected description = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId) this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service.getByCustomer(this.customerId).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.loadSource();
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(
          'Galleria non disponibile',
          error?.error?.message ?? 'Impossibile caricare le foto.',
        );
      },
    });
  }

  private loadSource(): void {
    this.service.resolveSource(this.customerId).subscribe({
      next: (source) => {
        this.sourcePhoto.set(source);
        this.sourceChanged.emit(source);
        this.loading.set(false);
      },
      error: () => {
        this.sourcePhoto.set(null);
        this.sourceChanged.emit(null);
        this.loading.set(false);
      },
    });
  }

  protected chooseFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  protected upload(): void {
    if (!this.selectedFile) {
      this.toast.warning('Seleziona una foto', 'Usa JPG, PNG oppure WEBP.');
      return;
    }
    this.uploading.set(true);
    this.service
      .upload(this.customerId, this.selectedFile, this.photoType, 'MANUAL_UPLOAD', this.description)
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.selectedFile = null;
          this.description = '';
          this.toast.success('Foto aggiunta', 'La galleria tecnica è stata aggiornata.');
          this.reload();
        },
        error: (error) => {
          this.uploading.set(false);
          this.toast.error(
            'Caricamento non riuscito',
            error?.error?.message ?? 'Impossibile caricare la foto.',
          );
        },
      });
  }

  protected selectSource(photo: CustomerPhoto): void {
    if (!photo.id) return;
    this.service.selectSimulationSource(photo.id).subscribe({
      next: () => {
        this.toast.success(
          'Foto di partenza aggiornata',
          'I suggerimenti useranno questa immagine.',
        );
        this.reload();
      },
      error: (error) =>
        this.toast.error('Selezione non riuscita', error?.error?.message ?? 'Riprova.'),
    });
  }

  protected selectPrimary(photo: CustomerPhoto): void {
    if (!photo.id) return;
    this.service.selectPrimary(photo.id).subscribe({
      next: () => this.reload(),
      error: (error) =>
        this.toast.error('Aggiornamento non riuscito', error?.error?.message ?? 'Riprova.'),
    });
  }

  protected remove(photo: CustomerPhoto): void {
    if (!photo.id || !confirm('Disattivare questa fotografia?')) return;
    this.service.deactivate(photo.id).subscribe({
      next: () => {
        this.toast.success('Foto rimossa', 'La fotografia non sarà più usata.');
        this.reload();
      },
      error: (error) =>
        this.toast.error('Rimozione non riuscita', error?.error?.message ?? 'Riprova.'),
    });
  }

  protected imageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/assets/'))
      return value;
    return value.startsWith('/hairlab/') ? `${HAIRLAB_SERVER_BASE_URL}${value}` : value;
  }

  protected typeLabel(type: CustomerPhotoType): string {
    return {
      PROFILE: 'Profilo',
      TECHNICAL: 'Tecnica',
      CONSULTATION: 'Consulenza',
      APPOINTMENT: 'Appuntamento',
      SIMULATION_SOURCE: 'Sorgente simulazione',
    }[type];
  }
}
