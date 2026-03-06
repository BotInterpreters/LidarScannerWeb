import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewScanComponent } from './preview-scan.component';

describe('PreviewScanComponent', () => {
  let component: PreviewScanComponent;
  let fixture: ComponentFixture<PreviewScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewScanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
