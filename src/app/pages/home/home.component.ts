import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { ScannedObjectsComponent } from '../../components/scanned-objects/scanned-objects.component';

@Component({
  selector: 'app-home',
  imports: [MaterialModule, ScannedObjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
