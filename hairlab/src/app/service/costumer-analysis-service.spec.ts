import { TestBed } from '@angular/core/testing';

import { CostumerAnalysisService } from './costumer-analysis-service';

describe('CostumerAnalysisService', () => {
  let service: CostumerAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostumerAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
