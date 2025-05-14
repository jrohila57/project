import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './app/shared/services/token-interceptor.service';
import { HttpErrorInterceptor } from './app/shared/services/http-error-interceptor.service';

bootstrapApplication(AppComponent, {
  providers: [
    ...(appConfig.providers ?? []),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
}).catch(err => console.error(err));
