import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcceptanceApi, CreateShareResponse } from './acceptance.api';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="grid grid-2">
            <div class="card">
                <div style="font-weight: 700; margin-bottom: 10px;">Create a share request</div>

                <div style="margin-bottom: 12px;">
                    <label>Receiver email</label>
                    <input [(ngModel)]="receiverEmail" placeholder="receiver@example.com" />
                </div>

                <div style="margin-bottom: 12px;">
                    <label>File name</label>
                    <input [(ngModel)]="fileName" placeholder="hello.txt" />
                </div>

                <div style="margin-bottom: 12px;">
                    <label>File contents (text)</label>
                    <textarea [(ngModel)]="fileText" placeholder="Type some content..."></textarea>
                    <div class="small">For demo purposes we store file bytes as base64 in SQLite.</div>
                </div>

                <div class="row">
                    <button class="primary" (click)="create()" [disabled]="isBusy">Create share request</button>
                    <div *ngIf="error" class="small" style="color: var(--danger);">{{ error }}</div>
                </div>
            </div>

            <div class="card">
                <div style="font-weight: 700; margin-bottom: 10px;">Next steps</div>

                <ng-container *ngIf="created; else emptyState">
                    <div class="small" style="margin-bottom: 10px;">
                        Status: <b>{{ created.status }}</b>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <div class="small">Receiver acceptance link:</div>
                        <div style="word-break: break-all;">
                            <a [href]="acceptUrl" target="_blank" rel="noopener">{{ acceptUrl }}</a>
                        </div>
                    </div>

                    <div class="small">
                        Download is blocked until receiver accepts. Even if you know the shareToken, backend will return 403 while PENDING.
                    </div>
                </ng-container>

                <ng-template #emptyState>
                    <div class="small">Create a share request to generate a receiver acceptance link.</div>
                </ng-template>
            </div>
        </div>
    `,
})
export class SenderCreateSharePageComponent {
    receiverEmail = '';
    fileName = 'hello.txt';
    fileText = 'Hello from Secure File Share!';
    isBusy = false;
    error: string | null = null;

    created: CreateShareResponse | null = null;

    constructor(private readonly api: AcceptanceApi) {}

    get acceptUrl(): string {
        if (!this.created) return '';
        return `${window.location.origin}/accept/${this.created.acceptanceToken}`;
    }

    async create() {
        this.isBusy = true;
        this.error = null;
        this.created = null;

        const base64 = btoa(unescape(encodeURIComponent(this.fileText)));

        this.api.createShare({
            receiverEmail: this.receiverEmail,
            fileName: this.fileName,
            fileContentBase64: base64,
        }).subscribe({
            next: (resp) => {
                this.created = resp;
                this.isBusy = false;
            },
            error: (err) => {
                this.error = err?.error?.error ?? 'Failed to create share.';
                this.isBusy = false;
            },
        });
    }
}
