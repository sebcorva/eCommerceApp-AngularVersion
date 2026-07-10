import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Compra } from '../../models/compra';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compras-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras-panel.html',
  styleUrl: './compras-panel.css',
})
export class ComprasPanel implements OnInit {

  todasLasCompras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  terminoBusqueda: string = '';

  totalRecaudado: number = 0;
  totalPendientes: number = 0;
  totalDespachados: number = 0;
  totalEntregados: number = 0;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarHistorialDeVentas();
  }

  cargarHistorialDeVentas(): void {
    this.dataService.getTodasLasCompras().subscribe({
      next: (compras) => {
        this.todasLasCompras = compras;
        this.comprasFiltradas = compras;

        // Calcular los KPIs de las tarjetas superiores
        this.calcularMetricas();

        // Forzamos a Bootstrap y Angular a renderizar los datos
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando el panel de administración:', err)
    });
  }

  calcularMetricas(): void {
    this.totalRecaudado = this.todasLasCompras.reduce((sum, c) => sum + c.total, 0);
    this.totalPendientes = this.todasLasCompras.filter(c => c.estado === 'Pendiente').length;
    this.totalDespachados = this.todasLasCompras.filter(c => c.estado === 'Despachado').length;
    this.totalEntregados = this.todasLasCompras.filter(c => c.estado === 'Entregado').length;
  }

  filtrarComprasLocalmente(): void {
    const busqueda = this.terminoBusqueda.trim().toLowerCase();
    if (!busqueda) {
      this.comprasFiltradas = this.todasLasCompras;
    } else {
      this.comprasFiltradas = this.todasLasCompras.filter(c =>
        c.nombreUsuario.toLowerCase().includes(busqueda) ||
        c.emailUsuario.toLowerCase().includes(busqueda) ||
        String(c.id).includes(busqueda)
      );
    }
  }

  cambiarEstado(compra: Compra, nuevoEstado: 'Pendiente' | 'Despachado' | 'Entregado'): void {
    // Clonamos el objeto de la compra y le cambiamos el estado
    const compraActualizada: Compra = { ...compra, estado: nuevoEstado };

    // Hacemos el PUT al db.json de forma asíncrona mediante el DataService
    this.dataService.actualizarEstadoCompra(compraActualizada).subscribe({
      next: (resultado) => {
        // Buscamos la compra original en nuestra lista local y la actualizamos
        const index = this.todasLasCompras.findIndex(c => c.id === resultado.id);
        if (index !== -1) {
          this.todasLasCompras[index] = resultado;
          this.filtrarComprasLocalmente(); // Refrescar filtro
          this.calcularMetricas();        // Refrescar tarjetas
          this.cdr.detectChanges();       // Forzar pintado HTML
        }
      },
      error: (err) => console.error('Error al actualizar el estado de la venta:', err)
    });
  }

  eliminarCompra(id: number | string | undefined): void {
    if (!id) return;

    // 1. Añadimos una ventana de confirmación para evitar accidentes
    if (confirm(`¿Estás completamente seguro de que deseas eliminar la compra #${id}? Esta acción no se puede deshacer.`)) {

      // 2. Ejecutamos la petición asíncrona DELETE
      this.dataService.eliminarCompraGlobal(id).subscribe({
        next: () => {
          // 3. Removemos la compra eliminada de nuestro arreglo local 'todasLasCompras'
          this.todasLasCompras = this.todasLasCompras.filter(c => c.id !== id);

          // 4. Refrescamos la vista, los filtros y recalculamos las métricas superiores
          this.filtrarComprasLocalmente();
          this.calcularMetricas();

          // 5. Forzamos el redibujado inmediato del HTML
          this.cdr.detectChanges();

          alert(`La compra #${id} fue eliminada con éxito.`);
        },
        error: (err) => console.error('Error al intentar eliminar la compra de la API:', err)
      });
    }
  }

  /**
   * Reutiliza de forma segura el método formateador de dinero chileno de tu DataService en el HTML
   */
  formatearPrecioGlobal(valor: number): string {
    return this.dataService.formatearPrecio(valor);
  }
}
