import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: any): void {
    console.error('🔥 Error global:', error);
  }
}
