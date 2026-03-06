import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannedObjectsComponent } from './scanned-objects.component';

describe('ScannedObjectsComponent', () => {
  let component: ScannedObjectsComponent;
  let fixture: ComponentFixture<ScannedObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannedObjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannedObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
