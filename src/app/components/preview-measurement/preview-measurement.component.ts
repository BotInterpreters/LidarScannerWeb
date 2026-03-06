import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-preview-measurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-measurement.component.html',
  styleUrl: './preview-measurement.component.scss'
})
export class PreviewMeasurementComponent {
  imageUrl: string | null = null;
  fileName = 'No file loaded';
  zoom = 1;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;
    this.imageUrl = URL.createObjectURL(file);
    this.zoom = 1;

    console.log('Loaded image:', this.imageUrl);
  }

  zoomIn() {
    this.zoom += 0.2;
  }

  zoomOut() {
    if (this.zoom > 0.4) this.zoom -= 0.2;
  }

  resetView() {
    this.zoom = 1;
  }
}