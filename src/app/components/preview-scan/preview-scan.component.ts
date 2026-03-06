import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

@Component({
  selector: 'app-preview-scan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-scan.component.html',
  styleUrls: ['./preview-scan.component.scss'],
})
export class PreviewScanComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewerContainer', { static: true })
  viewerContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId: number | null = null;

  private currentObject: THREE.Object3D | null = null;
  private gridHelper!: THREE.GridHelper;
  private axesHelper!: THREE.AxesHelper;

  fileName = 'No file loaded';
  wireframe = false;
  showGrid = true;
  showAxes = false;

  ngAfterViewInit(): void {
    this.initScene();
    this.addLights();
    this.addHelpers();
    this.animate();
    window.addEventListener('resize', this.onResize);

    setTimeout(() => {
      this.onResize();
    }, 0);

    setTimeout(() => {
      this.onResize();
    }, 200);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.controls?.dispose();
    this.renderer?.dispose();
    this.clearCurrentObject();
  }

  private initScene(): void {
    const container = this.viewerContainer.nativeElement;
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 500);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f14);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
    this.camera.position.set(0, 1.2, 3);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true, // ✅ needed for JPEG export
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private addLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-4, 3, -5);
    this.scene.add(fill);
  }

  private addHelpers(): void {
    this.gridHelper = new THREE.GridHelper(10, 10);
    this.gridHelper.visible = this.showGrid;
    this.scene.add(this.gridHelper);

    this.axesHelper = new THREE.AxesHelper(1);
    this.axesHelper.visible = this.showAxes;
    this.scene.add(this.axesHelper);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.loadFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loadFile(file);
    input.value = '';
  }

  private loadFile(file: File): void {
    this.fileName = file.name;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const url = URL.createObjectURL(file);

    this.clearCurrentObject();

    if (ext === 'obj') {
      this.loadObj(url);
      return;
    }

    if (ext === 'ply') {
      this.loadPly(url);
      return;
    }

    alert('Unsupported file type. Please upload an OBJ or PLY file.');
    URL.revokeObjectURL(url);
  }

  private loadObj(url: string): void {
    const loader = new OBJLoader();

    loader.load(
      url,
      (object) => {
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xd9d9d9,
              roughness: 0.9,
              metalness: 0.05,
              wireframe: this.wireframe,
            });
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        this.prepareObject(object);
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error('OBJ load error:', error);
        URL.revokeObjectURL(url);
      },
    );
  }

  private loadPly(url: string): void {
    const loader = new PLYLoader();

    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();

        const hasVertexColors = geometry.hasAttribute('color');

        const material = new THREE.MeshStandardMaterial({
          color: hasVertexColors ? 0xffffff : 0xd9d9d9,
          vertexColors: hasVertexColors,
          roughness: 0.9,
          metalness: 0.05,
          wireframe: this.wireframe,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.prepareObject(mesh);
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error('PLY load error:', error);
        URL.revokeObjectURL(url);
      },
    );
  }

  private prepareObject(object: THREE.Object3D): void {
    this.centerAndScaleObject(object);
    this.scene.add(object);
    this.currentObject = object;
    this.fitCameraToObject(object);
  }

  private centerAndScaleObject(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    object.position.sub(center);

    const maxAxis = Math.max(size.x, size.y, size.z);
    if (maxAxis > 0) {
      const scale = 2 / maxAxis;
      object.scale.setScalar(scale);
    }

    const updatedBox = new THREE.Box3().setFromObject(object);
    const updatedCenter = new THREE.Vector3();
    updatedBox.getCenter(updatedCenter);
    object.position.sub(updatedCenter);
  }

  private fitCameraToObject(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 1.8;

    this.camera.position.set(
      center.x,
      center.y + maxDim * 0.35,
      center.z + cameraZ,
    );
    this.camera.near = Math.max(maxDim / 100, 0.01);
    this.camera.far = Math.max(maxDim * 100, 1000);
    this.camera.updateProjectionMatrix();

    this.controls.target.copy(center);
    this.controls.minDistance = Math.max(maxDim * 0.2, 0.1);
    this.controls.maxDistance = Math.max(maxDim * 10, 10);
    this.controls.update();
  }

  toggleWireframe(): void {
    this.wireframe = !this.wireframe;
    this.applyMaterialFlags();
  }

  toggleGrid(): void {
    this.showGrid = !this.showGrid;
    this.gridHelper.visible = this.showGrid;
  }

  toggleAxes(): void {
    this.showAxes = !this.showAxes;
    this.axesHelper.visible = this.showAxes;
  }

  resetView(): void {
    if (this.currentObject) {
      this.fitCameraToObject(this.currentObject);
      return;
    }

    this.camera.position.set(0, 1.2, 3);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  exportJpeg(): void {
    if (!this.renderer || !this.currentObject) return;

    const previousGridVisible = this.gridHelper?.visible ?? false;
    const previousAxesVisible = this.axesHelper?.visible ?? false;

    if (this.gridHelper) this.gridHelper.visible = false;
    if (this.axesHelper) this.axesHelper.visible = false;

    this.renderer.render(this.scene, this.camera);

    const link = document.createElement('a');
    const safeName =
      this.fileName && this.fileName !== 'No file loaded'
        ? this.fileName.replace(/\.[^/.]+$/, '')
        : 'scan_preview';

    link.href = this.renderer.domElement.toDataURL('image/jpeg', 0.95);
    link.download = `${safeName}.jpg`;
    link.click();

    if (this.gridHelper) this.gridHelper.visible = previousGridVisible;
    if (this.axesHelper) this.axesHelper.visible = previousAxesVisible;
  }

  private applyMaterialFlags(): void {
    if (!this.currentObject) return;

    this.currentObject.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material;

        if (Array.isArray(material)) {
          material.forEach((m) => {
            if ('wireframe' in m) {
              m.wireframe = this.wireframe;
              m.needsUpdate = true;
            }
          });
        } else if (material && 'wireframe' in material) {
          material.wireframe = this.wireframe;
          material.needsUpdate = true;
        }
      }
    });
  }

  private clearCurrentObject(): void {
    if (!this.currentObject) return;

    this.scene.remove(this.currentObject);

    this.currentObject.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });

    this.currentObject = null;
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    if (!this.viewerContainer || !this.camera || !this.renderer) return;

    const container = this.viewerContainer.nativeElement;
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 500);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}
