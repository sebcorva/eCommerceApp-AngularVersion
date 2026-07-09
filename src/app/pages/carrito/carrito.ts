import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ElementoCarrito } from '../../models/elemento-carrito';

/**
 * Componente que administra la vista y operaciones del carrito de compras de aniMug.
 * Permite listar artículos seleccionados, incrementar o decrementar cantidades interactuando 
 * con las limitaciones de stock, calcular subtotales dinámicos y simular el cierre de la orden de compra.
 */
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {

  /** Almacena la colección de productos y cantidades agregadas por el cliente actual. */
  carrito: ElementoCarrito[] = [];

  /** Identificador único (email) del cliente activo, ocupado como índice de persistencia del carrito. */
  emailUsuario: string = '';

  constructor(
    public dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Ciclo de inicialización. Verifica que exista un usuario en sesión; si es anónimo,
   * redirige forzosamente hacia la pantalla de Login. De estar autenticado, extrae 
   * su correo e inicia la carga de datos del carrito.
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.authService.autenticado || !this.authService.sesion) {
      this.router.navigate(['/login']);
      return;
    }
    this.emailUsuario = this.authService.sesion.email;
    this.cargarCarrito();
  }

  /**
   * Recupera el estado actual del carrito del cliente consultando la persistencia a través de `DataService`.
   * @returns {void}
   */
  cargarCarrito(): void {
    this.carrito = this.dataService.getCarritoUsuario(this.emailUsuario);
  }

  /**
   * Incrementa en una unidad la cantidad de un artículo en el carrito, siempre que no exceda 
   * el stock físico disponible en el inventario global del producto.
   * @param {ElementoCarrito} item El elemento del carrito cuya cantidad se desea aumentar.
   * @returns {void}
   */
  sumarCantidad(item: ElementoCarrito): void {
    if (item.cantidad < item.producto.stock) {
      item.cantidad += 1;
      this.actualizarAlmacenamiento();
    } else {
      alert('Alcanzaste el límite de stock disponible.');
    }
  }

  /**
   * Decrementa en una unidad la cantidad de un artículo. Si la cantidad resultante llega a cero, 
   * remueve el ítem por completo del listado del carrito.
   * @param {ElementoCarrito} item El elemento del carrito cuya cantidad se desea reducir.
   * @returns {void}
   */
  restarCantidad(item: ElementoCarrito): void {
    item.cantidad -= 1;
    if (item.cantidad <= 0) {
      this.eliminarProducto(item);
    } else {
      this.actualizarAlmacenamiento();
    }
  }

  /**
   * Remueve de forma definitiva un producto del arreglo del carrito aplicando un filtro por ID.
   * @param {ElementoCarrito} item Elemento a descartar del listado.
   * @returns {void}
   */
  eliminarProducto(item: ElementoCarrito): void {
    this.carrito = this.carrito.filter(x => x.producto.id !== item.producto.id);
    this.actualizarAlmacenamiento();
  }

  /**
   * Sincroniza y persiste el estado actual del arreglo local del carrito en el almacenamiento del navegador.
   * @private
   * @returns {void}
   */
  private actualizarAlmacenamiento(): void {
    this.dataService.guardarCarritoUsuario(this.emailUsuario, this.carrito);
  }

  /**
   * Getter que computa de forma reactiva la suma de los precios finales multiplicados por su cantidad, 
   * aplicando de forma dinámica los descuentos que posea cada producto.
   * @returns {number} Suma monetaria total acumulada de los artículos del carro.
   */
  get subtotalAcumulado(): number {
    return this.carrito.reduce((suma, item) => {
      return suma + (this.dataService.calcularPrecioFinal(item.producto) * item.cantidad);
    }, 0);
  }

  /**
   * Getter que expone la cuantía total final que el cliente debe pagar.
   * @returns {number} Valor idéntico al subtotal acumulado.
   */
  get totalAPagar(): number {
    return this.subtotalAcumulado;
  }

  /**
   * Simula la finalización del flujo de checkout. Despliega una notificación de éxito,
   * vacía el estado del carrito tanto en memoria como en almacenamiento y redirige al usuario a la página de inicio.
   * @returns {void}
   */
  procesarPago(): void {
    alert('¡Gracias por tu compra en aniMug! Procesando pago...');
    this.dataService.limpiarCarritoUsuario(this.emailUsuario);
    this.router.navigate(['/']);
  }
}