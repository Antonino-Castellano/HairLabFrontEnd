import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import {
  CustomerAiConsent,
  GrantAiConsentRequest,
  RevokeAiConsentRequest,
} from '../models/ai-consent';

@Injectable({ providedIn: 'root' })
export class AiConsentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('ai-consent');

  current(customerId: number): Observable<CustomerAiConsent> {
    return this.http.get<CustomerAiConsent>(`${this.apiUrl}/customer/${customerId}`);
  }

  history(customerId: number): Observable<CustomerAiConsent[]> {
    return this.http.get<CustomerAiConsent[]>(`${this.apiUrl}/customer/${customerId}/history`);
  }

  grant(customerId: number, request: GrantAiConsentRequest): Observable<CustomerAiConsent> {
    return this.http.post<CustomerAiConsent>(
      `${this.apiUrl}/customer/${customerId}/grant`,
      request,
    );
  }

  revoke(customerId: number, request: RevokeAiConsentRequest): Observable<CustomerAiConsent> {
    return this.http.post<CustomerAiConsent>(
      `${this.apiUrl}/customer/${customerId}/revoke`,
      request,
    );
  }
}
