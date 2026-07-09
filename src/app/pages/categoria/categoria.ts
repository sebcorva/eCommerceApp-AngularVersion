import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DataService } from '../../services/data.service';
import { Producto } from '../../models/producto';
import { Categorias } from '../../models/categoria';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria implements OnInit {

  categoriaIdUrl: string = '';
  categoriaInfo: Categorias | null = null;
  productosFiltrados: Producto[] = [];

  constructor(
    private route: ActivatedRoute,
    public dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoriaIdUrl = params.get('id') || params.get('nombre') || '';

      if (this.categoriaIdUrl) {
        this.cargarDatosVíaAPI(this.categoriaIdUrl);
      }
    });
  }

  /**
   * Centraliza la carga asíncrona tanto de la información de la categoría como de sus productos desde la API.
   */
  cargarDatosVíaAPI(categoriaKey: string): void {
    this.dataService.getCategorias().subscribe({
      next: (categoriasMapa) => {
        this.categoriaInfo = categoriasMapa[categoriaKey] || null;

        this.dataService.getProductosPorCategoria(categoriaKey).subscribe({
          next: (productos) => {
            this.productosFiltrados = productos;
          },
          error: (err) => console.error('Error al filtrar productos en la API:', err)
        });
      },
      error: (err) => console.error('Error al obtener el mapa de categorías de la API:', err)
    });
  }

  agregarProducto(producto: any): void {

    if (!this.authService.autenticado || !this.authService.sesion) {
      alert('Debes iniciar sesión para añadir productos al carrito.');
      return;
    }

    const emailUsuario = this.authService.sesion.email;
    let carrito = this.dataService.getCarritoUsuario(emailUsuario);

    const existente = carrito.find(item => Number(item.producto.id) === Number(producto.id));

    if (existente) {
      if (existente.cantidad < producto.stock) {
        existente.cantidad += 1;
      } else {
        alert('No puedes agregar más de este producto, superaría el stock disponible.');
        return;
      }
    } else {
      carrito.push({
        producto: producto,
        cantidad: 1
      });
    }
    this.dataService.guardarCarritoUsuario(emailUsuario, carrito);

    producto.animando = true;
    setTimeout(() => {
      producto.animando = false;
    }, 400);
  }
}
