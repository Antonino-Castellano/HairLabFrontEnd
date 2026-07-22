import { TestBed } from '@angular/core/testing';

import { ColorAnalysisService } from './color-analysis-service';

describe('ColorAnalysisService', () => {
  let service: ColorAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
