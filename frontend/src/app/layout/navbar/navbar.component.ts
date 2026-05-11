import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <span routerLink="/dashboard" style="cursor:pointer;font-weight:700;letter-spacing:1px">
        <mat-icon style="vertical-align:middle;margin-right:6px">account_balance</mat-icon>Digital Banking
      </span>
      <span style="flex:1"></span>

      <ng-container *ngIf="user">
        <a mat-button routerLink="/dashboard" routerLinkActive="nav-active">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/clients" routerLinkActive="nav-active">
          <mat-icon>people</mat-icon> Clients
        </a>
        <a mat-button routerLink="/wallets" routerLinkActive="nav-active">
          <mat-icon>account_balance_wallet</mat-icon> Accounts
        </a>
        <a mat-button routerLink="/chat" routerLinkActive="nav-active">
          <mat-icon>chat</mat-icon> Chat
        </a>

        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div mat-menu-item disabled style="font-size:12px;opacity:.7">{{ user.username }}</div>
          <a mat-menu-item routerLink="/profile">
            <mat-icon>manage_wallets</mat-icon> Profile
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>
      </ng-container>

      <ng-container *ngIf="!user">
        <a mat-button routerLink="/auth/login">Login</a>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [`
    .nav-active { background: rgba(255,255,255,.15); border-radius: 4px; }
  `]
})
export class NavbarComponent implements OnInit {
  user: AuthResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  logout() {
    this.authService.logout();
  }
}
