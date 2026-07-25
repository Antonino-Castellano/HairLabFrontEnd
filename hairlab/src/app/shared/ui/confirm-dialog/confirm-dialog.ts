import { Component, HostListener, inject } from '@angular/core';

import { ConfirmDialogService } from '../confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  protected readonly dialogService = inject(ConfirmDialogService);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.dialogService.state()) {
      this.dialogService.resolve(false);
    }
  }
}
