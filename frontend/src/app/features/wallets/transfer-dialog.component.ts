import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Transfer Funds</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:flex;flex-direction:column;gap:12px;min-width:320px;padding-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Destination Account ID</mat-label>
          <input matInput formControlName="walletIdDestination" placeholder="Enter destination account ID">
          <mat-error *ngIf="form.get('walletIdDestination')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0.01">
          <mat-error *ngIf="form.get('amount')?.invalid">Amount must be greater than 0</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description">
          <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="accent" [disabled]="form.invalid" (click)="submit()">Transfer</button>
    </mat-dialog-actions>
  `
})
export class TransferDialogComponent {
  form: FormGroup;

  constructor(
    fb: FormBuilder,
    public dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public walletIdSource: string
  ) {
    this.form = fb.group({
      walletIdDestination: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['Transfer', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close({
        walletIdSource: this.walletIdSource,
        ...this.form.value
      });
    }
  }
}
