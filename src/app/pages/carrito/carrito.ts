import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ElementoCarrito } from '../../services/modelos';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {

  carrito: ElementoCarrito[] = [];
  emailUsuario: string = '';

  constructor(
    public dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.autenticado || !this.authService.sesion) {
      this.router.navigate(['/login']);
      return;
    }
    this.emailUsuario = this.authService.sesion.email;
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.carrito = this.dataService.getCarritoUsuario(this.emailUsuario);
  }

  sumarCantidad(item: ElementoCarrito): void {
    if (item.cantidad < item.producto.stock) {
      item.cantidad += 1;
      this.actualizarAlmacenamiento();
    } else {
      alert('Alcanzaste el límite de stock disponible.');
    }
  }

  restarCantidad(item: ElementoCarrito): void {
    item.cantidad -= 1;
    if (item.cantidad <= 0) {
      this.eliminarProducto(item);
    } else {
      this.actualizarAlmacenamiento();
    }
  }

  eliminarProducto(item: ElementoCarrito): void {
    this.carrito = this.carrito.filter(x => x.producto.id !== item.producto.id);
    this.actualizarAlmacenamiento();
  }

  private actualizarAlmacenamiento(): void {
    this.dataService.guardarCarritoUsuario(this.emailUsuario, this.carrito);
  }

  get subtotalAcumulado(): number {
    return this.carrito.reduce((suma, item) => {
      return suma + (this.dataService.calcularPrecioFinal(item.producto) * item.cantidad);
    }, 0);
  }

  get totalAPagar(): number {
    return this.subtotalAcumulado;
  }

  procesarPago(): void {
    alert('¡Gracias por tu compra en aniMug! Procesando pago...');
    this.dataService.limpiarCarritoUsuario(this.emailUsuario);
    this.router.navigate(['/']);
  }
}
