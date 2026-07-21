import { TestBed } from '@angular/core/testing';

import { AppointmentItemService } from './appointment-item-service';

describe('AppointmentItemService', () => {
  let service: AppointmentItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
