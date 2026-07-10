import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Compra } from '../../models/compra';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras implements OnInit {

  comprasUsuario: Compra[] = [];

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtenerHistorialCliente();
  }

  obtenerHistorialCliente(): void {
    const emailUsuario = this.authService.sesion?.email;

    if (emailUsuario) {
      this.dataService.getComprasPorUsuario(emailUsuario).subscribe({
        next: (compras) => {
          this.comprasUsuario = compras;

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al recuperar el historial de compras del usuario:', err);
        }
      });
    }
  }

  /**
   * Comunica de forma directa el formateador de monedas CLP del DataService con el HTML
   */
  formatearPrecioGlobal(valor: number): string {
    return this.dataService.formatearPrecio(valor);
  }
}
