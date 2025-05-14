import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Temporarily return true for testing
    return true;
    
    /* Original implementation:
    if (this.authService.isLoggedIn) {
      return true;
    }

    // Not logged in, redirect to login page with a return url
    this.toastService.warning('Please log in to access this page');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
    */
  }
}
