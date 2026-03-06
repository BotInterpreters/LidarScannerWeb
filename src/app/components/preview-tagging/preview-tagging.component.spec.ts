import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTaggingComponent } from './preview-tagging.component';

describe('PreviewTaggingComponent', () => {
  let component: PreviewTaggingComponent;
  let fixture: ComponentFixture<PreviewTaggingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewTaggingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewTaggingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
