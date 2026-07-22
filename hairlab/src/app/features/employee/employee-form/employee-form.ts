import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { JobTitle } from '../../../models/enums/job-title';
import { Specialization } from '../../../models/enums/specialization';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../service/employee-service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly jobTitles = Object.values(JobTitle);
  protected readonly specializationsList = Object.values(Specialization);

  protected employeeId?: number;
  protected readonly isEditMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly profileImage = signal<string | null>(null);
  protected readonly processingImage = signal(false);

  protected readonly employeeForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    telephoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    jobTitle: ['' as JobTitle, Validators.required],
    specializations: [[] as Specialization[]],
    hireDate: ['', Validators.required],
    notes: [''],
    active: [true]
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage.set('ID dipendente non valido.');
      return;
    }

    this.employeeId = id;
    this.isEditMode.set(true);
    this.loadEmployee(id);
  }

  private loadEmployee(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          telephoneNumber: employee.telephoneNumber,
          email: employee.email,
          jobTitle: employee.jobTitle,
          specializations: employee.specializations ?? [],
          hireDate: employee.hireDate,
          notes: employee.notes ?? '',
          active: employee.active
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare il dipendente.');
        this.loading.set(false);
      }
    });
  }

  protected async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Il file selezionato non è un’immagine valida.');
      input.value = '';
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      this.errorMessage.set('La foto è troppo grande. Dimensione massima: 10 MB.');
      input.value = '';
      return;
    }

    this.processingImage.set(true);
    this.errorMessage.set('');

    try {
      const resizedImage = await this.resizeImage(file);
      this.profileImage.set(resizedImage);
    } catch {
      this.errorMessage.set('Impossibile elaborare la fotografia selezionata.');
    } finally {
      this.processingImage.set(false);
      input.value = '';
    }
  }

  private resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const outputSize = 400;
          const canvas = document.createElement('canvas');
          canvas.width = outputSize;
          canvas.height = outputSize;

          const context = canvas.getContext('2d');
          if (!context) {
            reject();
            return;
          }

          const sourceSize = Math.min(image.width, image.height);
          const sourceX = (image.width - sourceSize) / 2;
          const sourceY = (image.height - sourceSize) / 2;

          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, outputSize, outputSize);
          context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };

        image.onerror = () => reject();
        image.src = String(reader.result);
      };

      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });
  }

  protected removeImage(): void {
    this.profileImage.set(null);
  }

  protected getPreviewInitials(): string {
    const firstName = this.employeeForm.controls.firstName.value;
    const lastName = this.employeeForm.controls.lastName.value;

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}` || '?';
  }

  protected submit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    if (this.processingImage()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue = this.employeeForm.getRawValue();

    const employee: Employee = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      telephoneNumber: formValue.telephoneNumber.trim(),
      email: formValue.email.trim(),
      jobTitle: formValue.jobTitle,
      specializations: formValue.specializations,
      hireDate: formValue.hireDate,
      notes: formValue.notes ? formValue.notes.trim() : undefined,
      active: formValue.active
    };

    if (this.isEditMode() && this.employeeId !== undefined) {
      this.employeeService.update(this.employeeId, employee).subscribe({
        next: () => this.router.navigate(['/employees', this.employeeId]),
        error: (error: HttpErrorResponse) => this.handleError(error, 'Impossibile modificare il dipendente.')
      });
      return;
    }

    this.employeeService.insert(employee).subscribe({
      next: (createdEmployee) => {
        if (createdEmployee.id) {
          this.router.navigate(['/employees', createdEmployee.id]);
          return;
        }
        this.router.navigate(['/employees']);
      },
      error: (error: HttpErrorResponse) => this.handleError(error, 'Impossibile inserire il dipendente.')
    });
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    this.loading.set(false);

    if (error.status === 400) {
      this.errorMessage.set(typeof error.error === 'string' ? error.error : 'I dati inseriti non sono validi.');
    } else if (error.status === 401) {
      this.errorMessage.set('Sessione scaduta.');
    } else if (error.status === 403) {
      this.errorMessage.set('Non hai i permessi necessari.');
    } else if (error.status === 0) {
      this.errorMessage.set('Impossibile comunicare con il backend.');
    } else {
      this.errorMessage.set(defaultMessage);
    }
  }
}