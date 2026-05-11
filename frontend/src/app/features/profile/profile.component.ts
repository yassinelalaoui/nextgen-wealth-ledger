import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, AuthResponse } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { fadeInUp } from '../../shared/animations';

function passwordsMatch(group: AbstractControl) {
  const newP = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newP === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  animations: [fadeInUp],
  template: `
    <div class="page-container" [@fadeInUp]>
      <h1 class="page-title">
        <mat-icon>manage_wallets</mat-icon> Profile
      </h1>

      <!-- User info card -->
      <mat-card class="mb-4" style="max-width:600px">
        <mat-card-header>
          <mat-card-title>Account Information</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding-top:16px" *ngIf="user">
          <div class="row g-2">
            <div class="col-md-6">
              <div style="font-size:.8rem;color:#777">Username</div>
              <div style="font-size:1.1rem;font-weight:600">{{ user.username }}</div>
            </div>
            <div class="col-md-6">
              <div style="font-size:.8rem;color:#777">Email</div>
              <div style="font-size:1.1rem">{{ user.email }}</div>
            </div>
            <div class="col-12" style="margin-top:8px">
              <div style="font-size:.8rem;color:#777">Roles</div>
              <div>{{ user.roles.join(', ') }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Change password -->
      <mat-card style="max-width:600px">
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding-top:16px">
          <form [formGroup]="passwordForm" style="display:flex;flex-direction:column;gap:12px">
            <mat-form-field appearance="outline">
              <mat-label>Current Password</mat-label>
              <input matInput type="password" formControlName="currentPassword">
              <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword">
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">Minimum 6 characters</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm New Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-error *ngIf="passwordForm.hasError('mismatch')">Passwords do not match</mat-error>
            </mat-form-field>

            <button mat-flat-button color="primary" [disabled]="passwordForm.invalid || saving"
              (click)="changePassword()">
              <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner>
              Change Password
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: AuthResponse | null = null;
  passwordForm!: FormGroup;
  saving = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.saving = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toastService.success('Password changed successfully');
        this.passwordForm.reset();
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }
}
