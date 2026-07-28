import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalonForm } from './salon-form';

describe('SalonForm', () => {
  let component: SalonForm;
  let fixture: ComponentFixture<SalonForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalonForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SalonForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
