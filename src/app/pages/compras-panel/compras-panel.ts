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
        this.calcularMetricas();
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
    const compraActualizada: Compra = { ...compra, estado: nuevoEstado };

    this.dataService.actualizarEstadoCompra(compraActualizada).subscribe({
      next: (resultado) => {
        const index = this.todasLasCompras.findIndex(c => c.id === resultado.id);
        if (index !== -1) {
          this.todasLasCompras[index] = resultado;
          this.filtrarComprasLocalmente();
          this.calcularMetricas();
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al actualizar el estado de la venta:', err)
    });
  }

  eliminarCompra(id: number | string | undefined): void {
    if (!id) return;

    if (confirm(`¿Estás completamente seguro de que deseas eliminar la compra #${id}? Esta acción no se puede deshacer.`)) {

      this.dataService.eliminarCompraGlobal(id).subscribe({
        next: () => {
          this.todasLasCompras = this.todasLasCompras.filter(c => c.id !== id);
          this.filtrarComprasLocalmente();
          this.calcularMetricas();
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
