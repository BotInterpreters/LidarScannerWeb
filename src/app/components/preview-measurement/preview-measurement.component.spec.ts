import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewMeasurementComponent } from './preview-measurement.component';

describe('PreviewMeasurementComponent', () => {
  let component: PreviewMeasurementComponent;
  let fixture: ComponentFixture<PreviewMeasurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewMeasurementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewMeasurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
