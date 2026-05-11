import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import {
  DashboardStatsDTO, MonthlyOperationStatsDTO,
  AccountTypeStatsDTO, AccountStatusStatsDTO
} from '../../core/models/dashboard.model';
import { fadeInUp, chartFade, pulseIn } from '../../shared/animations';

Chart.register(...registerables);

type CardState = 'loading' | 'empty' | 'error' | 'ready';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, NgChartsModule],
  animations: [fadeInUp, chartFade, pulseIn],
  template: `
    <div class="page-container" [@fadeInUp]>
      <h1 class="page-title">
        <mat-icon style="font-size:32px;width:32px;height:32px">dashboard</mat-icon>
        Dashboard
      </h1>

      <!-- KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <mat-card class="kpi-card" [@pulseIn]>
            <mat-card-content>
              <div class="kpi-icon" style="background:linear-gradient(135deg, #059669, #10b981)">
                <mat-icon>people</mat-icon>
              </div>
              <div class="kpi-value">{{ kpi(statsState, stats?.totalClients) }}</div>
              <div class="kpi-label">Total Clients</div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3 col-sm-6">
          <mat-card class="kpi-card" [@pulseIn]>
            <mat-card-content>
              <div class="kpi-icon" style="background:linear-gradient(135deg, #0f766e, #14b8a6)">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="kpi-value">{{ kpi(statsState, stats?.totalAccounts) }}</div>
              <div class="kpi-label">Total Wallets</div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3 col-sm-6">
          <mat-card class="kpi-card" [@pulseIn]>
            <mat-card-content>
              <div class="kpi-icon" style="background:linear-gradient(135deg, #b45309, #f59e0b)">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="kpi-value" style="font-size:1.4rem">
                {{ statsState === 'ready' ? (stats!.totalBalance | currency:'MAD':'symbol':'1.0-0') : '—' }}
              </div>
              <div class="kpi-label">Total Balance</div>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="col-md-3 col-sm-6">
          <mat-card class="kpi-card" [@pulseIn]>
            <mat-card-content>
              <div class="kpi-icon" style="background:linear-gradient(135deg, #be185d, #ec4899)">
                <mat-icon>swap_horiz</mat-icon>
              </div>
              <div class="kpi-value">{{ kpi(statsState, stats?.ledgerEntriesCount) }}</div>
              <div class="kpi-label">Total Entries</div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Charts -->
      <div class="row g-3">
        <!-- Monthly ledgerEntries -->
        <div class="col-lg-8">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon style="vertical-align:middle;color:#10b981">bar_chart</mat-icon>
                Monthly Operations
              </mat-card-title>
              <mat-card-subtitle>Credits vs Debits over time</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="monthlyState === 'loading'">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
              <div *ngIf="monthlyState === 'empty' || monthlyState === 'error'" class="empty-state">
                <mat-icon>query_stats</mat-icon>
                <div class="empty-title">No ledgerEntries yet</div>
                <div class="empty-subtitle">{{ monthlyState === 'error' ? 'Unable to load chart data.' : 'Once wallets have ledgerEntries, you\\'ll see trends here.' }}</div>
              </div>
              <div *ngIf="monthlyState === 'ready'" style="width:100%;height:280px" [@chartFade]>
                <canvas baseChart [data]="barChartData" [options]="barChartOptions" type="bar"></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Account types + statuses stacked -->
        <div class="col-lg-4">
          <mat-card class="chart-card mb-3">
            <mat-card-header>
              <mat-card-title>
                <mat-icon style="vertical-align:middle;color:#14b8a6">donut_large</mat-icon>
                Wallet Types
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="typesState === 'loading'"><mat-spinner diameter="36"></mat-spinner></div>
              <div *ngIf="typesState === 'empty' || typesState === 'error'" class="empty-state">
                <mat-icon>pie_chart_outline</mat-icon>
                <div class="empty-title">No wallets yet</div>
                <div class="empty-subtitle">Create wallets to see distribution.</div>
              </div>
              <div *ngIf="typesState === 'ready'" style="width:100%;height:220px" [@chartFade]>
                <canvas baseChart [data]="doughnutChartData" [options]="pieOptions" type="doughnut"></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon style="vertical-align:middle;color:#e879f9">pie_chart</mat-icon>
                Wallet Status
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="statusesState === 'loading'"><mat-spinner diameter="36"></mat-spinner></div>
              <div *ngIf="statusesState === 'empty' || statusesState === 'error'" class="empty-state">
                <mat-icon>pie_chart_outline</mat-icon>
                <div class="empty-title">No status data</div>
                <div class="empty-subtitle">Create wallets to populate.</div>
              </div>
              <div *ngIf="statusesState === 'ready'" style="width:100%;height:220px" [@chartFade]>
                <canvas baseChart [data]="statusChartData" [options]="pieOptions" type="pie"></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  statsState: CardState = 'loading';
  monthlyState: CardState = 'loading';
  typesState: CardState = 'loading';
  statusesState: CardState = 'loading';

  stats: DashboardStatsDTO | null = null;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#94a3b8',
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, color: '#f8fafc' } } },
    scales: { 
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#94a3b8' } }, 
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } } 
    }
  };

  doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  statusChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#f8fafc',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, color: '#f8fafc' } } }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadStats();
    this.loadMonthly();
    this.loadTypes();
    this.loadStatuses();
  }

  kpi(state: CardState, value: number | undefined): string {
    if (state !== 'ready' || value === undefined || value === null) return '—';
    return String(value);
  }

  private loadStats() {
    this.dashboardService.stats().pipe(catchError(() => of(null))).subscribe(data => {
      if (!data) { this.statsState = 'error'; return; }
      this.stats = data;
      this.statsState = 'ready';
    });
  }

  private loadMonthly() {
    this.dashboardService.monthlyOperations().pipe(catchError(() => of(null))).subscribe(data => {
      if (data === null) { this.monthlyState = 'error'; return; }
      const hasData = data.length > 0 && data.some(d => Number(d.totalCredit) + Number(d.totalDebit) > 0);
      if (!hasData) { this.monthlyState = 'empty'; return; }
      this.barChartData = {
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Credits', data: data.map(d => Number(d.totalCredit)), backgroundColor: '#10b981', borderRadius: 6 },
          { label: 'Debits',  data: data.map(d => Number(d.totalDebit)),  backgroundColor: '#f43f5e', borderRadius: 6 }
        ]
      };
      this.monthlyState = 'ready';
    });
  }

  private loadTypes() {
    this.dashboardService.accountTypeStats().pipe(catchError(() => of(null))).subscribe(data => {
      if (data === null) { this.typesState = 'error'; return; }
      const hasData = data.length > 0 && data.some(d => d.count > 0);
      if (!hasData) { this.typesState = 'empty'; return; }
      this.doughnutChartData = {
        labels: data.map(d => this.prettyType(d.type)),
        datasets: [{ data: data.map(d => d.count), backgroundColor: ['#10b981', '#14b8a6', '#3b82f6', '#8b5cf6'], borderWidth: 0, borderColor: '#1e293b' }]
      };
      this.typesState = 'ready';
    });
  }

  private loadStatuses() {
    this.dashboardService.accountStatusStats().pipe(catchError(() => of(null))).subscribe(data => {
      if (data === null) { this.statusesState = 'error'; return; }
      const hasData = data.length > 0 && data.some(d => d.count > 0);
      if (!hasData) { this.statusesState = 'empty'; return; }
      this.statusChartData = {
        labels: data.map(d => d.status),
        datasets: [{ data: data.map(d => d.count), backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'], borderWidth: 0, borderColor: '#1e293b' }]
      };
      this.statusesState = 'ready';
    });
  }

  private prettyType(t: string): string {
    if (t === 'ActiveWallet') return 'Active Wallet';
    if (t === 'StashWallet') return 'Stash Wallet';
    return t;
  }
}
