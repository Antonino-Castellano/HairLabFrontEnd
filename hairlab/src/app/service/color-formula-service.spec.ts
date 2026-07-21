import { TestBed } from '@angular/core/testing';

import { ColorFormulaService } from './color-formula-service';

describe('ColorFormulaService', () => {
  let service: ColorFormulaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorFormulaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
