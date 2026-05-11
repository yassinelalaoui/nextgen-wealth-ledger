import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ClientService } from '../../core/services/client.service';
import { ClientDTO } from '../../core/models/client.model';

@Component({
  selector: 'app-saving-account-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>New Saving Account</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:flex;flex-direction:column;gap:12px;min-width:320px;padding-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Client</mat-label>
          <mat-select formControlName="clientId">
            <mat-option *ngFor="let c of clients" [value]="c.id">{{ c.name }} ({{ c.email }})</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('clientId')?.hasError('required')">Client is required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Initial Balance</mat-label>
          <input matInput type="number" formControlName="initialBalance" min="0">
          <mat-error *ngIf="form.get('initialBalance')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Interest Rate (%)</mat-label>
          <input matInput type="number" formControlName="interestRate" min="0" max="100" step="0.1">
          <mat-error *ngIf="form.get('interestRate')?.hasError('required')">Required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Currency</mat-label>
          <input matInput formControlName="currency" placeholder="MAD">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Create</button>
    </mat-dialog-actions>
  `
})
export class StashWalletDialogComponent implements OnInit {
  form!: FormGroup;
  clients: ClientDTO[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StashWalletDialogComponent>,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      interestRate: [5.5, [Validators.required, Validators.min(0)]],
      currency: ['MAD']
    });
    this.clientService.list().subscribe(cs => this.clients = cs);
  }

  submit() {
    if (this.form.valid) this.dialogRef.close(this.form.value);
  }
}
