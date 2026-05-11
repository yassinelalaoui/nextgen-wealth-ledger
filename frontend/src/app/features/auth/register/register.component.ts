import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { slideUp } from '../../../shared/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  animations: [slideUp],
  template: `
    <div class="auth-bg">
      <mat-card class="auth-card" [@slideUp]>
        <div style="text-align:center;padding-top:24px">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#e91e63,#f06292);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 20px rgba(233,30,99,.3)">
            <mat-icon style="color:white;font-size:32px;width:32px;height:32px">person_add</mat-icon>
          </div>
            <mat-card-header style="justify-content:center;padding-bottom:8px">
              <mat-card-title style="font-size:1.5rem">Create Account</mat-card-title>
              <mat-card-subtitle>Register to get started</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="padding-top:16px">
              <div style="display:flex;flex-direction:column;gap:12px">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput [(ngModel)]="user.username" name="username" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [(ngModel)]="user.email" name="email" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" [(ngModel)]="user.password" name="password" required>
                </mat-form-field>
                <button mat-flat-button color="primary" style="height:44px" [disabled]="loading" (click)="onRegister()">
                  <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
                  {{ loading ? 'Creating account...' : 'Register' }}
                </button>
              </div>
            </mat-card-content>
            <mat-card-actions style="justify-content:center;padding-bottom:20px">
              <span style="font-size:.9rem">Already have an account? <a routerLink="/auth/login">Login</a></span>
            </mat-card-actions>
        </div>
      </mat-card>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: RegisterRequest = { username: '', email: '', password: '' };
  loading = false;

  onRegister() {
    this.loading = true;
    this.authService.register(this.user).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => { this.loading = false; }
    });
  }
}
