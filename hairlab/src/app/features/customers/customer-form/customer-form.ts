import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Customer } from '../../../models/customer';
import { CustomerService } from '../../../service/customer-service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css'
})
export class CustomerFormComponent implements OnInit {
  /**
   * FormBuilder permette di creare
   * e gestire il Reactive Form.
   */
  private readonly formBuilder =
    inject(FormBuilder);

  /**
   * Service utilizzato per comunicare
   * con il backend.
   */
  private readonly customerService =
    inject(CustomerService);

  /**
   * ActivatedRoute permette di recuperare
   * l'ID presente nell'URL.
   *
   * Esempio:
   *
   * /customers/1/edit
   */
  private readonly activatedRoute =
    inject(ActivatedRoute);

  /**
   * Router permette di cambiare pagina
   * dopo il salvataggio.
   */
  private readonly router =
    inject(Router);

  /**
   * ID del cliente in modifica.
   *
   * Rimane undefined quando
   * stiamo creando un nuovo cliente.
   */
  protected customerId?: number;

  /**
   * Indica se il form viene utilizzato
   * per modificare un cliente esistente.
   */
  protected readonly isEditMode =
    signal(false);

  /**
   * Indica se è in corso
   * una richiesta HTTP.
   */
  protected readonly loading =
    signal(false);

  /**
   * Eventuale messaggio di errore.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Contiene la foto profilo convertita
   * in Base64.
   *
   * Viene utilizzata sia come anteprima
   * sia come valore da inviare al backend.
   */
  protected readonly profileImage =
    signal<string | null>(null);

  /**
   * Indica se Angular sta elaborando
   * e ridimensionando una fotografia.
   */
  protected readonly processingImage =
    signal(false);

  /**
   * Reactive Form del cliente.
   *
   * La foto NON viene inserita direttamente
   * nel FormGroup perché viene gestita
   * separatamente tramite profileImage.
   */
  protected readonly customerForm =
    this.formBuilder.nonNullable.group({
      firstName: [
        '',
        Validators.required
      ],

      lastName: [
        '',
        Validators.required
      ],

      phoneNumber: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      dob: [
        '',
        Validators.required
      ],

      active: [
        true
      ]
    });

  /**
   * Quando il componente viene inizializzato
   * controlliamo se nell'URL esiste un ID.
   *
   * Se esiste:
   * modalità modifica.
   *
   * Se non esiste:
   * modalità creazione.
   */
  ngOnInit(): void {
    const idParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('id');

    /**
     * Nessun ID significa
     * nuovo cliente.
     */
    if (!idParam) {
      return;
    }

    const id =
      Number(idParam);

    /**
     * Controlliamo che l'ID sia valido.
     */
    if (
      Number.isNaN(id) ||
      id <= 0
    ) {
      this.errorMessage.set(
        'ID cliente non valido.'
      );

      return;
    }

    this.customerId =
      id;

    this.isEditMode.set(
      true
    );

    this.loadCustomer(
      id
    );
  }

  /**
   * Recupera dal backend il cliente
   * da modificare.
   */
  private loadCustomer(
    id: number
  ): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService
      .getById(id)
      .subscribe({
        next: customer => {
          /**
           * Precompiliamo il form
           * con i dati ricevuti.
           */
          this.customerForm.patchValue({
            firstName:
              customer.firstName,

            lastName:
              customer.lastName,

            phoneNumber:
              customer.phoneNumber,

            email:
              customer.email,

            dob:
              customer.dob,

            active:
              customer.active
          });

          /**
           * Recuperiamo anche la foto esistente.
           *
           * Se non esiste salviamo null.
           */
          this.profileImage.set(
            customer.profileImage ?? null
          );

          this.loading.set(false);
        },

        error: () => {
          this.errorMessage.set(
            'Impossibile caricare il cliente.'
          );

          this.loading.set(false);
        }
      });
  }

  /**
   * Metodo eseguito quando l'utente
   * seleziona un'immagine dal computer.
   */
  protected async onImageSelected(
    event: Event
  ): Promise<void> {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    /**
     * Se non è stato selezionato alcun file
     * interrompiamo il metodo.
     */
    if (!file) {
      return;
    }

    /**
     * Accettiamo solamente immagini.
     */
    if (
      !file.type.startsWith('image/')
    ) {
      this.errorMessage.set(
        'Il file selezionato non è un’immagine valida.'
      );

      input.value = '';

      return;
    }

    /**
     * Limite di sicurezza:
     * massimo 10 MB per il file originale.
     *
     * L'immagine finale sarà comunque
     * molto più piccola perché verrà ridimensionata.
     */
    const maxFileSize =
      10 * 1024 * 1024;

    if (
      file.size > maxFileSize
    ) {
      this.errorMessage.set(
        'La foto è troppo grande. Dimensione massima: 10 MB.'
      );

      input.value = '';

      return;
    }

    this.processingImage.set(true);
    this.errorMessage.set('');

    try {
      /**
       * Ridimensioniamo e comprimiamo
       * la fotografia prima di salvarla.
       */
      const resizedImage =
        await this.resizeImage(file);

      /**
       * Salviamo la stringa Base64.
       *
       * Il template aggiorna immediatamente
       * l'anteprima.
       */
      this.profileImage.set(
        resizedImage
      );
    } catch {
      this.errorMessage.set(
        'Impossibile elaborare la fotografia selezionata.'
      );
    } finally {
      this.processingImage.set(false);

      /**
       * Puliamo il valore dell'input.
       *
       * In questo modo è possibile selezionare
       * nuovamente anche lo stesso file.
       */
      input.value = '';
    }
  }

  /**
   * Ridimensiona la fotografia.
   *
   * Procedimento:
   *
   * 1. legge il file;
   * 2. crea un'immagine;
   * 3. ritaglia la parte centrale in formato quadrato;
   * 4. ridimensiona a 400 x 400;
   * 5. converte in JPEG;
   * 6. restituisce una stringa Base64.
   */
  private resizeImage(
    file: File
  ): Promise<string> {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          const image =
            new Image();

          image.onload = () => {
            /**
             * Dimensione finale dell'avatar.
             */
            const outputSize =
              400;

            const canvas =
              document.createElement(
                'canvas'
              );

            canvas.width =
              outputSize;

            canvas.height =
              outputSize;

            const context =
              canvas.getContext('2d');

            if (!context) {
              reject();

              return;
            }

            /**
             * Calcoliamo il lato minore.
             *
             * In questo modo ritagliamo
             * un quadrato centrale.
             */
            const sourceSize =
              Math.min(
                image.width,
                image.height
              );

            const sourceX =
              (
                image.width -
                sourceSize
              ) / 2;

            const sourceY =
              (
                image.height -
                sourceSize
              ) / 2;

            /**
             * Inseriamo uno sfondo bianco.
             *
             * È utile soprattutto se viene
             * caricata un'immagine PNG trasparente.
             */
            context.fillStyle =
              '#ffffff';

            context.fillRect(
              0,
              0,
              outputSize,
              outputSize
            );

            /**
             * Disegniamo nel canvas
             * il ritaglio centrale dell'immagine.
             */
            context.drawImage(
              image,
              sourceX,
              sourceY,
              sourceSize,
              sourceSize,
              0,
              0,
              outputSize,
              outputSize
            );

            /**
             * Convertiamo in JPEG
             * con qualità 82%.
             *
             * Questo riduce molto
             * il peso della stringa Base64.
             */
            const result =
              canvas.toDataURL(
                'image/jpeg',
                0.82
              );

            resolve(
              result
            );
          };

          image.onerror = () => {
            reject();
          };

          image.src =
            String(
              reader.result
            );
        };

        reader.onerror = () => {
          reject();
        };

        reader.readAsDataURL(
          file
        );
      }
    );
  }

  /**
   * Rimuove la fotografia.
   *
   * Impostando null:
   *
   * - sparisce l'anteprima;
   * - il backend riceverà profileImage = null;
   * - MySQL cancellerà la foto;
   * - verranno mostrate le iniziali.
   */
  protected removeImage(): void {
    this.profileImage.set(
      null
    );
  }

  /**
   * Restituisce le iniziali
   * utilizzate quando non esiste una foto.
   *
   * Esempio:
   *
   * Maria Esposito -> ME
   */
  protected getPreviewInitials(): string {
    const firstName =
      this.customerForm.controls
        .firstName.value;

    const lastName =
      this.customerForm.controls
        .lastName.value;

    const firstInitial =
      firstName
        ? firstName.charAt(0)
            .toUpperCase()
        : '';

    const lastInitial =
      lastName
        ? lastName.charAt(0)
            .toUpperCase()
        : '';

    return (
      `${firstInitial}${lastInitial}` ||
      '?'
    );
  }

  /**
   * Salva il cliente.
   *
   * Se siamo in modalità creazione:
   * POST.
   *
   * Se siamo in modalità modifica:
   * PUT.
   */
  protected submit(): void {
    if (
      this.customerForm.invalid
    ) {
      this.customerForm
        .markAllAsTouched();

      return;
    }

    /**
     * Evitiamo il salvataggio
     * mentre la foto viene elaborata.
     */
    if (
      this.processingImage()
    ) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue =
      this.customerForm
        .getRawValue();

    /**
     * Costruiamo il Customer
     * che verrà inviato al backend.
     */
    const customer: Customer = {
      firstName:
        formValue.firstName.trim(),

      lastName:
        formValue.lastName.trim(),

      phoneNumber:
        formValue.phoneNumber.trim(),

      email:
        formValue.email.trim(),

      dob:
        formValue.dob,

      active:
        formValue.active,

      /**
       * Inseriamo anche la fotografia Base64.
       */
      profileImage:
        this.profileImage()
    };

    /**
     * MODIFICA.
     */
    if (
      this.isEditMode() &&
      this.customerId !== undefined
    ) {
      this.customerService
        .update(
          this.customerId,
          customer
        )
        .subscribe({
          next: () => {
            this.router.navigate([
              '/customers',
              this.customerId
            ]);
          },

          error: (
            error: HttpErrorResponse
          ) => {
            this.handleError(
              error,
              'Impossibile modificare il cliente.'
            );
          }
        });

      return;
    }

    /**
     * CREAZIONE.
     */
    this.customerService
      .insert(customer)
      .subscribe({
        next: createdCustomer => {
          /**
           * Se il backend restituisce l'ID
           * andiamo direttamente al dettaglio.
           */
          if (
            createdCustomer.id
          ) {
            this.router.navigate([
              '/customers',
              createdCustomer.id
            ]);

            return;
          }

          /**
           * Fallback verso la lista.
           */
          this.router.navigate([
            '/customers'
          ]);
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.handleError(
            error,
            'Impossibile inserire il cliente.'
          );
        }
      });
  }

  /**
   * Gestisce gli errori HTTP.
   */
  private handleError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): void {
    this.loading.set(false);

    if (
      error.status === 400
    ) {
      this.errorMessage.set(
        typeof error.error === 'string'
          ? error.error
          : 'I dati inseriti non sono validi.'
      );
    } else if (
      error.status === 401
    ) {
      this.errorMessage.set(
        'Sessione scaduta.'
      );
    } else if (
      error.status === 403
    ) {
      this.errorMessage.set(
        'Non hai i permessi necessari.'
      );
    } else if (
      error.status === 0
    ) {
      this.errorMessage.set(
        'Impossibile comunicare con il backend.'
      );
    } else {
      this.errorMessage.set(
        defaultMessage
      );
    }
  }
}