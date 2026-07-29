import { DatePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { HAIRLAB_SERVER_BASE_URL } from "../../core/config/api.config";
import { CustomerAiConsent } from "../../models/ai-consent";
import { ColorPalette } from "../../models/color-analysis";
import { CustomerArea } from "../../models/customer-area";
import { CustomerPhoto, CustomerPhotoType } from "../../models/customer-photo";
import { AppointmentStatus } from "../../models/enums/appointment-status";
import { ConsultationType } from "../../models/enums/consultation-type";
import { CustomerAreaService } from "../../service/customer-area-service";
import { UserService } from "../../service/user-service";
import { hairLabTechnicalLabel } from "../../shared/ui/hairlab-technical-labels";
import { ToastService } from "../../shared/ui/toast.service";
import {
  HAIR_CONDITION_LABELS,
  HAIR_LENGTH_LABELS,
  HAIR_TEXTURE_LABELS,
  HAIR_TYPE_LABELS,
  PHYSICAL_VALUE_LABELS,
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS,
} from "../customers/hair-profile/hair-profile-display";

type CustomerProfileSection =
  "hair" | "face" | "beard" | "color" | "privacy" | "history";

@Component({
  selector: "app-customer-profile",
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: "./customer-profile.html",
  styleUrl: "./customer-profile.css",
})
export class CustomerProfileComponent implements OnInit, OnDestroy {
  private readonly customerAreaService = inject(CustomerAreaService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  protected readonly area = signal<CustomerArea | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal("");
  protected readonly activeSection = signal<CustomerProfileSection>("hair");

  protected readonly photos = signal<CustomerPhoto[]>([]);
  protected readonly consent = signal<CustomerAiConsent | null>(null);
  protected readonly assetsLoading = signal(false);
  protected readonly uploadingPhoto = signal(false);
  protected readonly consentBusy = signal(false);
  protected readonly selectedPhotoFile = signal<File | null>(null);
  protected readonly photoPreview = signal<string | null>(null);
  protected readonly photoType = signal<CustomerPhotoType>("TECHNICAL");
  protected readonly photoDescription = signal("");
  protected readonly consentAccepted = signal(false);
  protected readonly consentNotes = signal("");

  protected readonly toneLabels = TONE_LEVEL_LABELS;
  protected readonly reflectionLabels = REFLECTION_LABELS;
  protected readonly hairTypeLabels = HAIR_TYPE_LABELS;
  protected readonly hairTextureLabels = HAIR_TEXTURE_LABELS;
  protected readonly physicalValueLabels = PHYSICAL_VALUE_LABELS;
  protected readonly hairConditionLabels = HAIR_CONDITION_LABELS;
  protected readonly hairLengthLabels = HAIR_LENGTH_LABELS;

  protected readonly consultationTypeLabels: Record<ConsultationType, string> =
    {
      [ConsultationType.HAIR_CUT]: "Taglio",
      [ConsultationType.HAIR_COLOR]: "Colore",
      [ConsultationType.HAIR_STYLING]: "Styling",
      [ConsultationType.SCALP_TREATMENT]: "Trattamento cute",
      [ConsultationType.HAIR_RESTORATION]: "Ricostruzione",
      [ConsultationType.HAIR_EXTENSION]: "Extension",
      [ConsultationType.HAIR_STRAIGHTENING]: "Stiratura",
      [ConsultationType.HAIR_PERMING]: "Permanente",
      [ConsultationType.HAIR_REPAIR]: "Riparazione",
      [ConsultationType.HAIR_ANALYSIS]: "Analisi capelli",
    };

  protected readonly completedAppointments = computed(() =>
    (this.area()?.appointmentDetails ?? []).filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED,
    ),
  );

  protected readonly primaryPhoto = computed(
    () => this.photos().find((photo) => photo.primaryPhoto) ?? null,
  );

  protected readonly simulationSource = computed(
    () => this.photos().find((photo) => photo.simulationSource) ?? null,
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.releasePreview();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set("");

    this.customerAreaService.getMyArea().subscribe({
      next: (area) => {
        this.area.set(area);
        this.loading.set(false);
        this.loadCustomerAssets();
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile caricare il tuo profilo HairLab.",
        );
      },
    });
  }

  protected loadCustomerAssets(): void {
    this.assetsLoading.set(true);
    let pendingRequests = 2;

    const finishRequest = (): void => {
      pendingRequests -= 1;
      if (pendingRequests <= 0) {
        this.assetsLoading.set(false);
      }
    };

    this.customerAreaService.getMyPhotos().subscribe({
      next: (photos) => {
        this.photos.set(photos);
        finishRequest();
      },
      error: (error: HttpErrorResponse) => {
        this.photos.set([]);
        finishRequest();
        this.toastService.error(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile caricare le tue fotografie.",
        );
      },
    });

    this.customerAreaService.getMyConsent().subscribe({
      next: (consent) => {
        this.consent.set(consent);
        finishRequest();
      },
      error: (error: HttpErrorResponse) => {
        this.consent.set(null);
        finishRequest();
        this.toastService.error(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile verificare il consenso IA.",
        );
      },
    });
  }

  protected selectSection(section: CustomerProfileSection): void {
    this.activeSection.set(section);
  }

  protected profileLabel(value: string | null | undefined): string {
    return hairLabTechnicalLabel(value);
  }

  protected paletteEntries(
    palette: ColorPalette | null | undefined,
  ): [string, string][] {
    return palette ? Object.entries(palette) : [];
  }

  protected choosePhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.resetSelectedPhoto();
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      input.value = "";
      this.toastService.warning(
        "Formato non supportato. Usa JPG, PNG oppure WEBP.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      input.value = "";
      this.toastService.warning("La fotografia non può superare 10 MB.");
      return;
    }

    this.releasePreview();
    this.selectedPhotoFile.set(file);
    this.photoPreview.set(URL.createObjectURL(file));
  }

  protected setPhotoType(event: Event): void {
    const value = (event.target as HTMLSelectElement)
      .value as CustomerPhotoType;
    this.photoType.set(value === "PROFILE" ? "PROFILE" : "TECHNICAL");
  }

  protected setPhotoDescription(event: Event): void {
    this.photoDescription.set((event.target as HTMLInputElement).value);
  }

  protected uploadPhoto(): void {
    const file = this.selectedPhotoFile();
    if (!file) {
      this.toastService.warning("Seleziona una fotografia prima di procedere.");
      return;
    }

    const selectedType = this.photoType();
    this.uploadingPhoto.set(true);

    this.customerAreaService
      .uploadMyPhoto(file, selectedType, this.photoDescription())
      .subscribe({
        next: () => {
          this.uploadingPhoto.set(false);
          this.resetSelectedPhoto();
          this.toastService.success("Fotografia aggiunta al tuo HairLab.");

          if (selectedType === "PROFILE") {
            this.refreshSynchronizedProfile();
          } else {
            this.loadCustomerAssets();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.uploadingPhoto.set(false);
          this.toastService.error(
            typeof error.error?.message === "string"
              ? error.error.message
              : "Impossibile caricare la fotografia.",
          );
        },
      });
  }

  protected selectPrimaryPhoto(photo: CustomerPhoto): void {
    if (!photo.id || photo.primaryPhoto) {
      return;
    }

    this.customerAreaService.selectMyPrimaryPhoto(photo.id).subscribe({
      next: () => {
        this.toastService.success("Immagine principale aggiornata.");
        this.refreshSynchronizedProfile();
      },
      error: (error: HttpErrorResponse) =>
        this.toastService.error(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile aggiornare la foto principale.",
        ),
    });
  }

  protected selectSimulationPhoto(photo: CustomerPhoto): void {
    if (!photo.id || photo.simulationSource || !this.consent()?.valid) {
      return;
    }

    this.customerAreaService.selectMySimulationSource(photo.id).subscribe({
      next: () => {
        this.toastService.success("Foto di partenza selezionata.");
        this.loadCustomerAssets();
      },
      error: (error: HttpErrorResponse) =>
        this.toastService.error(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile selezionare la foto di partenza.",
        ),
    });
  }

  protected removePhoto(photo: CustomerPhoto): void {
    if (
      !photo.id ||
      !confirm("Rimuovere questa fotografia dalla tua galleria?")
    ) {
      return;
    }

    this.customerAreaService.removeMyPhoto(photo.id).subscribe({
      next: () => {
        this.toastService.success("Fotografia rimossa.");
        if (photo.primaryPhoto) {
          this.refreshSynchronizedProfile();
        } else {
          this.loadCustomerAssets();
        }
      },
      error: (error: HttpErrorResponse) =>
        this.toastService.error(
          typeof error.error?.message === "string"
            ? error.error.message
            : "Impossibile rimuovere la fotografia.",
        ),
    });
  }

  protected setConsentAccepted(event: Event): void {
    this.consentAccepted.set((event.target as HTMLInputElement).checked);
  }

  protected setConsentNotes(event: Event): void {
    this.consentNotes.set((event.target as HTMLTextAreaElement).value);
  }

  protected grantConsent(): void {
    if (!this.consentAccepted()) {
      this.toastService.warning(
        "Conferma di avere letto e accettato l’informativa.",
      );
      return;
    }

    this.consentBusy.set(true);
    this.customerAreaService
      .grantMyConsent({
        confirmed: true,
        documentVersion: "CUSTOMER_PORTAL_V1",
        notes: this.consentNotes().trim() || undefined,
      })
      .subscribe({
        next: (consent) => {
          this.consent.set(consent);
          this.consentBusy.set(false);
          this.consentAccepted.set(false);
          this.consentNotes.set("");
          this.toastService.success("Consenso IA registrato correttamente.");
        },
        error: (error: HttpErrorResponse) => {
          this.consentBusy.set(false);
          this.toastService.error(
            typeof error.error?.message === "string"
              ? error.error.message
              : "Impossibile registrare il consenso.",
          );
        },
      });
  }

  protected revokeConsent(): void {
    if (
      !confirm("Revocare il consenso alle elaborazioni fotografiche con IA?")
    ) {
      return;
    }

    this.consentBusy.set(true);
    this.customerAreaService
      .revokeMyConsent({
        reason: "Revoca effettuata dal portale cliente",
        deletePhotos: false,
        deleteSimulations: false,
      })
      .subscribe({
        next: (consent) => {
          this.consent.set(consent);
          this.consentBusy.set(false);
          this.toastService.success("Consenso IA revocato.");
        },
        error: (error: HttpErrorResponse) => {
          this.consentBusy.set(false);
          this.toastService.error(
            typeof error.error?.message === "string"
              ? error.error.message
              : "Impossibile revocare il consenso.",
          );
        },
      });
  }

  protected imageUrl(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    if (
      value.startsWith("data:") ||
      value.startsWith("http") ||
      value.startsWith("/assets/")
    ) {
      return value;
    }

    return value.startsWith("/") ? `${HAIRLAB_SERVER_BASE_URL}${value}` : value;
  }

  protected photoTypeLabel(type: CustomerPhotoType): string {
    return {
      PROFILE: "Profilo",
      TECHNICAL: "Foto tecnica",
      CONSULTATION: "Consulenza",
      APPOINTMENT: "Appuntamento",
      SIMULATION_SOURCE: "Foto di partenza",
    }[type];
  }

  protected canRemovePhoto(photo: CustomerPhoto): boolean {
    return photo.source === "MANUAL_UPLOAD";
  }

  private refreshSynchronizedProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: () => this.loadProfile(),
      error: () => this.loadProfile(),
    });
  }

  private resetSelectedPhoto(): void {
    this.releasePreview();
    this.selectedPhotoFile.set(null);
    this.photoDescription.set("");
    this.photoType.set("TECHNICAL");
  }

  private releasePreview(): void {
    const preview = this.photoPreview();
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    this.photoPreview.set(null);
  }
}
