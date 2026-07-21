import { TestBed } from '@angular/core/testing';

import { SalonProductService } from './salon-product-service';

describe('SalonProductService', () => {
  let service: SalonProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalonProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
