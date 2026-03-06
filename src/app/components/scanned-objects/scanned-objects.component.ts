import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { PreviewScanComponent } from '../preview-scan/preview-scan.component';
import { PreviewMeasurementComponent } from '../preview-measurement/preview-measurement.component';
import { PreviewTaggingComponent } from '../preview-tagging/preview-tagging.component';

@Component({
  selector: 'app-scanned-objects',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './scanned-objects.component.html',
  styleUrls: ['./scanned-objects.component.scss']
})
export class ScannedObjectsComponent {

  dialog = inject(MatDialog);
  
  openDialog(): void {
    this.dialog.open(PreviewScanComponent, {
      width: '800px',
      maxWidth: '95vw'
    });
  }

  openDialogMeasurement(): void {
    this.dialog.open(PreviewMeasurementComponent, {
      width: '800px',
      maxWidth: '95vw'
    });
  }

   openDialogEvidenceTagging(): void {
    this.dialog.open(PreviewTaggingComponent, {
      width: '800px',
      maxWidth: '95vw'
    });
  }



}