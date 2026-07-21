import { TestBed } from '@angular/core/testing';

import { ColorFormulaItemService } from './color-formula-item-service';

describe('ColorFormulaItemService', () => {
  let service: ColorFormulaItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorFormulaItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
