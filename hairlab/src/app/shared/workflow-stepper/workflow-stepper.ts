import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface WorkflowStep {
  id: number;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-workflow-stepper',
  standalone: true,
  templateUrl: './workflow-stepper.html',
  styleUrl: './workflow-stepper.css',
})
export class WorkflowStepperComponent {
  @Input({ required: true }) steps: WorkflowStep[] = [];
  @Input() activeStep = 1;
  @Input() maxAvailableStep = 1;
  @Output() readonly stepChange = new EventEmitter<number>();

  protected selectStep(step: number): void {
    if (step <= this.maxAvailableStep) {
      this.stepChange.emit(step);
    }
  }
}
