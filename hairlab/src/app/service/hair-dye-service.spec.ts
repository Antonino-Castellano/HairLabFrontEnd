import { TestBed } from '@angular/core/testing';

import { HairDyeService } from './hair-dye-service';

describe('HairDyeService', () => {
  let service: HairDyeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HairDyeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
