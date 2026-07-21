import { TestBed } from '@angular/core/testing';

import { HairProfileService } from './hair-profile-service';

describe('HairProfileService', () => {
  let service: HairProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HairProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
