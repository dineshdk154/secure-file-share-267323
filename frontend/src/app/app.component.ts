import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    template: `
        <div class="container">
            <div class="row" style="justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <div style="font-weight: 700; font-size: 18px;">Secure File Share</div>
                    <div class="small">Downloads are blocked until the receiver accepts.</div>
                </div>
                <a routerLink="/">Create share</a>
            </div>

            <router-outlet></router-outlet>
        </div>
    `,
})
export class AppComponent {}
