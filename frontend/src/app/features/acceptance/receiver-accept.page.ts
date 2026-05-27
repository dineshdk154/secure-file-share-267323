import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { AcceptanceApi, AcceptanceInfoResponse } from './acceptance.api';

@Component({
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div style="font-weight: 700; margin-bottom: 10px;">Receiver acceptance</div>

            <ng-container *ngIf="loading">
                <div class="small">Loading…</div>
            </ng-container>

            <ng-container *ngIf="error">
                <div class="small" style="color: var(--danger);">{{ error }}</div>
            </ng-container>

            <ng-container *ngIf="info">
                <div class="grid" style="margin-bottom: 12px;">
                    <div class="small">Receiver: <b>{{ info.receiver_email }}</b></div>
                    <div class="small">File: <b>{{ info.file_name }}</b></div>
                    <div class="small">Status: <b>{{ info.status }}</b></div>
                </div>

                <div class="row">
                    <button class="primary" (click)="accept()" [disabled]="isBusy || info.status !== 'PENDING'">Accept</button>
                    <button (click)="download()" [disabled]="isBusy || !shareToken">Download</button>
                    <div *ngIf="message" class="small">{{ message }}</div>
                </div>

                <div class="small" style="margin-top: 10px;">
                    Download stays blocked until acceptance. If you try to download before accepting, backend responds 403.
                </div>
            </ng-container>
        </div>
    `,
})
export class ReceiverAcceptPageComponent implements OnInit, OnDestroy {
    private sub: Subscription | null = null;

    acceptanceToken = '';
    info: AcceptanceInfoResponse | null = null;
    shareToken: string | null = null;

    loading = true;
    isBusy = false;
    error: string | null = null;
    message: string | null = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly api: AcceptanceApi
    ) {}

    ngOnInit(): void {
        this.sub = this.route.paramMap.subscribe((p) => {
            this.acceptanceToken = p.get('acceptanceToken') ?? '';
            this.fetchInfo();
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    fetchInfo(): void {
        this.loading = true;
        this.error = null;
        this.message = null;
        this.shareToken = null;

        this.api.getAcceptanceInfo(this.acceptanceToken).subscribe({
            next: (info) => {
                this.info = info;
                this.loading = false;
            },
            error: (err) => {
                this.error = err?.error?.error ?? 'Could not load share request.';
                this.loading = false;
            },
        });
    }

    accept(): void {
        this.isBusy = true;
        this.error = null;
        this.message = null;

        this.api.accept(this.acceptanceToken).subscribe({
            next: (resp) => {
                this.shareToken = resp.shareToken;
                this.message = 'Accepted. You can now download.';
                // Refresh status display
                this.api.getAcceptanceInfo(this.acceptanceToken).subscribe((info) => (this.info = info));
                this.isBusy = false;
            },
            error: (err) => {
                this.error = err?.error?.error ?? 'Failed to accept.';
                this.isBusy = false;
            },
        });
    }

    download(): void {
        if (!this.shareToken) return;

        this.isBusy = true;
        this.error = null;
        this.message = null;

        this.api.download(this.shareToken).subscribe({
            next: (blob) => {
                // Trigger browser download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'download';
                a.click();
                URL.revokeObjectURL(url);
                this.isBusy = false;
            },
            error: (err) => {
                this.error = err?.error?.error ?? 'Download failed.';
                this.isBusy = false;
            },
        });
    }
}
