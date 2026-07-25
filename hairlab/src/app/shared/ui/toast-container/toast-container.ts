import { Component, inject } from '@angular/core';

import { ToastService } from '../toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
