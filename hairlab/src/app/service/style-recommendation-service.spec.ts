import { TestBed } from '@angular/core/testing';

import { StyleRecommendationService } from './style-recommendation-service';

describe('StyleRecommendationService', () => {
  let service: StyleRecommendationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StyleRecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
