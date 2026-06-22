import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Producto } from '../../services/modelos';

@Component({
  selector: 'app-producto-panel',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './producto-panel.html',
  styleUrl: './producto-panel.css',
})
export class ProductoPanel implements OnInit {

  listaProductos: Producto[] = [];
  editandoId: number | null = null;

  productoForm: FormGroup;
  enviado = false;

  constructor(
    public dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      descuento: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      imagen: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.autenticado || this.authService.sesion?.role !== 'admin') {
      alert('Acceso denegado. Se requieren permisos de Administrador.');
      this.router.navigate(['/']);
      return;
    }

    this.cargarTabla();
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.productoForm.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.productoForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  cargarTabla(): void {
    this.listaProductos = this.dataService.getProductosGlobales();
  }

  onGuardarProducto(): void {
    this.enviado = true;

    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    const formValues = this.productoForm.getRawValue();

    if (this.editandoId) {
      const editado: Producto = {
        id: this.editandoId,
        nombre: formValues.nombre.trim(),
        categoria: formValues.categoria,
        precio: formValues.precio,
        descuento: formValues.descuento || 0,
        stock: formValues.stock,
        imagen: formValues.imagen.trim(),
        descripcion: formValues.descripcion.trim()
      };

      this.dataService.actualizarProductoGlobal(editado);
      alert('Producto actualizado correctamente');
    } else {
      const productosActuales = this.dataService.getProductosGlobales();
      const nombreNormalizado = formValues.nombre.trim().toLowerCase();

      if (productosActuales.some(p => p.nombre?.trim().toLocaleLowerCase() === nombreNormalizado)) {
        alert('Ya existe un producto con ese nombre. Por favor, elige otro.');
        return;
      }

      const nuevoProducto: Omit<Producto, 'id'> = {
        nombre: formValues.nombre.trim(),
        categoria: formValues.categoria,
        precio: formValues.precio,
        descuento: formValues.descuento || 0,
        stock: formValues.stock,
        imagen: formValues.imagen.trim(),
        descripcion: formValues.descripcion.trim()
      };

      this.dataService.agregarProductoGlobal(nuevoProducto as Producto);
      alert('Producto agregado exitosamente');
    }

    this.cancelarEdicion();
    this.cargarTabla();
  }

  activarEdicion(producto: Producto): void {
    this.editandoId = producto.id;
    this.enviado = false;

    this.productoForm.patchValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      descuento: producto.descuento,
      stock: producto.stock,
      imagen: producto.imagen,
      descripcion: producto.descripcion
    });
  }

  eliminarProducto(id: number | string): void {
    if (confirm('¿Estás completamente seguro de eliminar este producto del catálogo?')) {
      this.dataService.eliminarProductoGlobal(id);
      this.cargarTabla();
    }
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.enviado = false;
    this.productoForm.reset({
      descuento: 0
    });
  }
}
