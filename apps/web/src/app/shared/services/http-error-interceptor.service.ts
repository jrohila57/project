import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Set loading state
    const url = request.url.split('?')[0]; // Remove query params
    this.loadingService.setLoading(true, url);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // End loading state
        this.loadingService.setLoading(false, url);

        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 401) {
            errorMessage = 'Unauthorized. Please log in again.';
          } else if (error.status === 403) {
            errorMessage = 'Forbidden. You do not have permission to access this resource.';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
          }
        }

        // Show toast message
        this.toastService.error(errorMessage);

        return throwError(() => error);
      })
    );
  }
}
