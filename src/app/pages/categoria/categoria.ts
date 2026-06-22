import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DataService } from '../../services/data.service';
import { Producto, Categorias } from '../../services/modelos';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria implements OnInit {

  categoriaNombre: string = '';
  categoriaInfo: Categorias | null = null;
  productosFiltrados: Producto[] = [];

  constructor(
    private route: ActivatedRoute,
    public dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoriaNombre = params.get('nombre') || '';
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    const categoriasMapa = this.dataService.categorias;
    this.categoriaInfo = categoriasMapa[this.categoriaNombre] || null;

    this.productosFiltrados = this.dataService.getProductosPorCategoria(this.categoriaNombre);
  }

  agregarProducto(producto: any): void {

    if (!this.authService.autenticado || !this.authService.sesion) {
      alert('Debes iniciar sesión para añadir productos al carrito.');
      return;
    }

    const emailUsuario = this.authService.sesion.email;
    //Obtener carrito de usuario segun su email
    let carrito = this.dataService.getCarritoUsuario(emailUsuario);

    //Verificar si el producto ya existe en el carrito
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
    alert(`¡${producto.nombre} añadido al carrito con éxito!`);
  }
}
