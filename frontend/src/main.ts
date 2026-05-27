import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

// PUBLIC_INTERFACE
/** Bootstraps the Angular application. */
bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideRouter(APP_ROUTES),
    ],
}).catch((err) => console.error(err));
