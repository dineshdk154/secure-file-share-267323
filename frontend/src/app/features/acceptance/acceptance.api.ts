import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateShareResponse {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    receiverEmail: string;
    createdAtIso: string;
    acceptanceToken: string;
    shareToken: string;
}

export interface AcceptanceInfoResponse {
    file_name: string;
    receiver_email: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at_iso: string;
}

export interface AcceptResponse {
    shareToken: string;
}

@Injectable({ providedIn: 'root' })
export class AcceptanceApi {
    constructor(private readonly http: HttpClient) {}

    // PUBLIC_INTERFACE
    /** Creates a share request (PENDING) that requires receiver acceptance before download. */
    createShare(body: { fileName: string; fileContentBase64: string; receiverEmail: string }): Observable<CreateShareResponse> {
        return this.http.post<CreateShareResponse>('/api/shares', body);
    }

    // PUBLIC_INTERFACE
    /** Gets receiver-facing metadata for an acceptance token (used to render accept page). */
    getAcceptanceInfo(acceptanceToken: string): Observable<AcceptanceInfoResponse> {
        return this.http.get<AcceptanceInfoResponse>(`/api/shares/accept/${encodeURIComponent(acceptanceToken)}`);
    }

    // PUBLIC_INTERFACE
    /** Accepts a share request (PENDING -> ACCEPTED) and returns the shareToken to enable download. */
    accept(acceptanceToken: string): Observable<AcceptResponse> {
        return this.http.post<AcceptResponse>(`/api/shares/accept/${encodeURIComponent(acceptanceToken)}`, {});
    }

    // PUBLIC_INTERFACE
    /** Downloads the shared file. Backend enforces ACCEPTED state; otherwise returns 403. */
    download(shareToken: string): Observable<Blob> {
        return this.http.get(`/api/shares/download/${encodeURIComponent(shareToken)}`, { responseType: 'blob' });
    }
}
