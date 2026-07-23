import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonProductList } from './salon-product-list';

describe('SalonProductList', () => {
  let component: SalonProductList;
  let fixture: ComponentFixture<SalonProductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalonProductList],
    }).compileComponents();

    fixture = TestBed.createComponent(SalonProductList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
