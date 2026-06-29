import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(
    public dataService: DataService,
    public authService: AuthService,
    private router: Router
  ) { }

  get rolUsuario(): string | undefined {
    return this.authService.sesion?.role;
  }

  logout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  get totalProductos(): number {
    return this.dataService.carritoSignal().reduce((total, item) => total + item.cantidad, 0);
  }
}
