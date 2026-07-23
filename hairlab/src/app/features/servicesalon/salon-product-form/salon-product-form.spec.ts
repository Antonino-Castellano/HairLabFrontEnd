import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonProductForm } from './salon-product-form';

describe('SalonProductForm', () => {
  let component: SalonProductForm;
  let fixture: ComponentFixture<SalonProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalonProductForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SalonProductForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
