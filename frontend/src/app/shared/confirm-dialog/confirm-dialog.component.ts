import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ title || 'Confirm' }}</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss('cancel')"></button>
    </div>
    <div class="modal-body">
      {{ message || 'Are you sure you want to perform this action?' }}
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss('cancel')">
        Cancel
      </button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close('confirm')">
        {{ confirmText || 'Confirm' }}
      </button>
    </div>
  `,
  styles: [
    `
    .modal-header {
      border-bottom: 1px solid #dee2e6;
    }
    .modal-footer {
      border-top: 1px solid #dee2e6;
    }
  `
  ]
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure you want to perform this action?';
  @Input() confirmText: string = 'Confirm';

  constructor(public activeModal: NgbActiveModal) {}
}
