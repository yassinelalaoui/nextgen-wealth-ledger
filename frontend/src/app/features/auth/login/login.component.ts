import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { slideUp } from '../../../shared/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  animations: [slideUp],
  template: `
    <div class="auth-bg">
      <mat-card class="auth-card" [@slideUp]>
        <div style="text-align:center;padding-top:24px">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#3f51b5,#5c6bc0);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 20px rgba(63,81,181,.3)">
            <mat-icon style="color:white;font-size:32px;width:32px;height:32px">account_balance</mat-icon>
          </div>
            <mat-card-header style="justify-content:center;padding-bottom:8px">
              <mat-card-title style="font-size:1.5rem">Digital Banking</mat-card-title>
              <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="padding-top:16px">
              <div style="display:flex;flex-direction:column;gap:12px">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput [(ngModel)]="credentials.username" name="username" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" [(ngModel)]="credentials.password" name="password" required (keydown.enter)="onLogin()">
                </mat-form-field>
                <button mat-flat-button color="primary" style="height:44px" [disabled]="loading" (click)="onLogin()">
                  <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
                  {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
              </div>
            </mat-card-content>
            <mat-card-actions style="justify-content:center;padding-bottom:20px">
              <span style="font-size:.9rem">Don't have an account? <a routerLink="/auth/register">Register</a></span>
            </mat-card-actions>
        </div>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  credentials: LoginRequest = { username: '', password: '' };
  loading = false;

  onLogin() {
    if (!this.credentials.username || !this.credentials.password) return;
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => { this.loading = false; }
    });
  }
}
