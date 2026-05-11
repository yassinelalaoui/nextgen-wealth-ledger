import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.navigate(['/auth/login']);
        toast.error('Session expired. Please log in again.');
      } else if (error.status === 403) {
        toast.error('Access denied: you do not have permission to perform this action.');
      } else if (error.status === 400) {
        const msg = error.error?.message || 'Validation error. Please check your input.';
        toast.error(msg);
      } else if (error.status === 404) {
        toast.error(error.error?.message || 'Resource not found.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      throw error;
    })
  );
};
