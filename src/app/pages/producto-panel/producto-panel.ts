import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { Producto } from '../../models/producto';

/**
 * Componente que representa el panel de administración de productos (CRUD).
 * Permite a los usuarios con rol de administrador listar, agregar, editar y eliminar 
 * productos del catálogo global de la tienda aniMug de manera reactiva.
 */
@Component({
  selector: 'app-producto-panel',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './producto-panel.html',
  styleUrl: './producto-panel.css',
})
export class ProductoPanel implements OnInit {

  /** Colección local de productos recuperados para renderizar en la tabla de administración. */
  listaProductos: Producto[] = [];

  /** * Almacena el ID numérico del producto en proceso de edición. 
   * Si su valor es `null`, el formulario opera bajo el modo de **Creación**.
   */
  editandoId: number | null = null;

  /** Formulario reactivo que agrupa las propiedades y validaciones del producto. */
  productoForm: FormGroup;

  /** Flag de control de envío para manejar de forma visual el despliegue de validaciones. */
  enviado = false;

  constructor(
    public dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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

  /**
   * Ciclo de inicialización del componente.
   * Actúa como barrera de seguridad; si el usuario no está autenticado o no posee el rol de 'admin',
   * bloquea el flujo con una alerta y lo redirige automáticamente a la raíz de la aplicación.
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.authService.autenticado || this.authService.sesion?.role !== 'admin') {
      if (typeof window !== 'undefined') {
        alert('Acceso denegado. Se requieren permisos de Administrador.');
      }
      this.router.navigate(['/']);
      return;
    }

    this.cargarTabla();
  }

  /**
   * Getter que expone el mapa interno de controles del formulario reactivo hacia la vista HTML.
   * @returns {{ [key: string]: AbstractControl }} Diccionario asociativo de controles.
   */
  get controles(): { [key: string]: AbstractControl } {
    return this.productoForm.controls;
  }

  /**
   * Determina si un campo específico debe resaltar con un estado de error en la interfaz.
   * @param {string} nombreCampo Identificador interno del control del formulario.
   * @returns {boolean} `true` si el control es inválido y se detectó interacción (`touched`, `dirty`) o envío forzado.
   */
  campoInvalido(nombreCampo: string): boolean {
    const control = this.productoForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  /**
   * Sincroniza la propiedad local `listaProductos` con los registros actualizados provistos por el `DataService`.
   * @returns {void}
   */
  cargarTabla(): void {
    this.dataService.getProductos().subscribe({
      next: (productos) => {
        this.listaProductos = productos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  /**
   * Procesa la sumisión del formulario. Ejecuta lógicas diferenciadas:
   * 1. **Modo Edición (`editandoId` activo):** Envía el objeto completo actualizado al servicio.
   * 2. **Modo Creación:** Valida nombres duplicados (insensible a mayúsculas) e inserta el nuevo registro.
   * Finalmente, limpia el formulario y refresca la grilla gráfica de datos.
   * @returns {void}
   */
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

      this.dataService.actualizarProductoGlobal(editado).subscribe({
        next: () => {
          alert('Producto actualizado correctamente');
          this.cancelarEdicion();
          this.cargarTabla();
        },
        error: (err) => alert('Error al actualizar el producto.')
      });
    } else {
      const nombreNormalizado = formValues.nombre.trim().toLowerCase();
      this.dataService.getProductos().subscribe({
        next: (productosActuales) => {
          if (productosActuales.some(p => p.nombre?.trim().toLowerCase() === nombreNormalizado)) {
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

          this.dataService.agregarProductoGlobal(nuevoProducto).subscribe({
            next: () => {
              alert('Producto agregado exitosamente');
              this.cancelarEdicion();
              this.cargarTabla();
            },
            error: (err) => alert('Error al agregar el producto.')
          });
        },
        error: (err) => alert('Error al consultar los productos existentes.')
      });
    }
  }

  /**
   * Activa el estado de edición del componente. Carga el ID del producto seleccionado y 
   * realiza una inyección de valores parciales (*patchValue*) directamente en los controles de formulario.
   * @param {Producto} producto Entidad del producto que se desea modificar.
   * @returns {void}
   */
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

    this.cdr.detectChanges();
  }

  /**
   * Intercepta la eliminación de un artículo solicitando una confirmación nativa al usuario.
   * De ser aprobada, remueve el registro a través del servicio de persistencia de datos.
   * @param {number | string} id Identificador único del producto a eliminar.
   * @returns {void}
   */
  eliminarProducto(id: number | string): void {
    if (confirm('¿Estás completamente seguro de eliminar este producto del catálogo?')) {
      this.dataService.eliminarProductoGlobal(id).subscribe({
        next: () => {
          alert('Producto eliminado exitosamente.');
          this.cargarTabla();
        },
        error: (err) => alert('Error al eliminar el producto.')
      });
    }
  }

  /**
   * Cancela la operación de edición actual regresando al componente a su modo base (Creación),
   * reseteando los estados de validación y devolviendo el descuento inicial a cero.
   * @returns {void}
   */
  cancelarEdicion(): void {
    this.editandoId = null;
    this.enviado = false;
    this.productoForm.reset({
      descuento: 0
    });
  }
}