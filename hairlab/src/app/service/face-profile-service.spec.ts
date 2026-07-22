import { TestBed } from '@angular/core/testing';

import { FaceProfileService } from './face-profile-service';

describe('FaceProfileService', () => {
  let service: FaceProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
