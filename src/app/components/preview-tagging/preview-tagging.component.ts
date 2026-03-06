import { Component } from '@angular/core';
import JSZip from 'jszip';

type EvidenceMetadata = {
  agency?: string;
  collectedBy?: string;
  itemNumber?: string;
  caseNumber?: string;
  date?: string;
  time?: string;
  description?: string;
  location?: string;
  remarks?: string;
  createdAt?: string;
  originalPhotoPath?: string;
};

@Component({
  selector: 'app-preview-tagging',
  imports: [],
  templateUrl: './preview-tagging.component.html',
  styleUrl: './preview-tagging.component.scss',
})
export class PreviewTaggingComponent {
  imageUrl: string | null = null;
  fileName = 'No file loaded';
  zoom = 1;
  dragActive = false;
  errorMessage = '';

  metadata: EvidenceMetadata | null = null;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    await this.loadFile(file);
    input.value = '';
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    await this.loadFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;
  }

  async loadFile(file: File) {
    this.clearError();
    this.revokePreview();

    this.fileName = file.name;
    this.zoom = 1;
    this.metadata = null;

    const lower = file.name.toLowerCase();

    try {
      if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png')
      ) {
        this.imageUrl = URL.createObjectURL(file);
        return;
      }

      if (lower.endsWith('.json')) {
        const text = await file.text();
        this.metadata = JSON.parse(text) as EvidenceMetadata;
        return;
      }

      if (lower.endsWith('.zip')) {
        await this.loadEvidenceZip(file);
        return;
      }

      this.errorMessage =
        'Unsupported file. Upload evidence JPG, JSON, or ZIP.';
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Failed to load file.';
    }
  }

  async loadEvidenceZip(file: File) {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files);

    const imageEntryName =
      entries.find((name) => /evidence\.(jpg|jpeg|png)$/i.test(name)) ||
      entries.find((name) => /\.(jpg|jpeg|png)$/i.test(name));

    const jsonEntryName =
      entries.find((name) => /evidence\.json$/i.test(name)) ||
      entries.find((name) => /\.json$/i.test(name));

    if (imageEntryName) {
      const imageBlob = await zip.file(imageEntryName)?.async('blob');
      if (imageBlob) {
        this.imageUrl = URL.createObjectURL(imageBlob);
      }
    }

    if (jsonEntryName) {
      const jsonText = await zip.file(jsonEntryName)?.async('text');
      if (jsonText) {
        this.metadata = JSON.parse(jsonText) as EvidenceMetadata;
      }
    }

    if (!imageEntryName && !jsonEntryName) {
      this.errorMessage =
        'ZIP loaded, but no evidence image or JSON was found.';
    }
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

  private clearError() {
    this.errorMessage = '';
  }

  private revokePreview() {
    if (this.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }
}
