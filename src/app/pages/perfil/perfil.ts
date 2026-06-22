import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Sesion, MensajeVista } from '../../services/modelos';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  //Guardar datos usuario conectado
  usuarioLogeado: Sesion | null = null;
  mensajeAlert: MensajeVista | null = null;

  //Modal Direcciones
  direccionForm: FormGroup;
  enviado = false;

  constructor(
    private readonly fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.direccionForm = this.fb.group({
      direccion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    //Validar que el usuario este logueado
    if (!this.authService.autenticado) {
      this.router.navigate(['login']);
      return;
    }
    //Recuperar el usuario
    this.usuarioLogeado = this.authService.sesion;
    //Cargar dirección si existe
    if (this.usuarioLogeado?.direccion) {
      this.direccionForm.patchValue({
        direccion: this.usuarioLogeado.direccion
      });
    }
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.direccionForm.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.direccionForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  onGuardarDireccion() {
    this.enviado = true;

    if (this.direccionForm.invalid || !this.usuarioLogeado) {
      this.mensajeAlert = { tipo: 'danger', texto: 'Por favor, ingresa una direccion valida.' };
      return;
    }

    const { direccion } = this.direccionForm.getRawValue();

    const resultado = this.authService.actualizarPerfil({
      nombre: this.usuarioLogeado.nombre,
      username: this.usuarioLogeado.username,
      email: this.usuarioLogeado.email,
      fechaNacimiento: this.usuarioLogeado.fechaNacimiento,
      direccion: direccion.trim()
    });

    if (resultado.ok) {
      this.mensajeAlert = { tipo: 'success', texto: 'Direccion de Despacho actualizada.' };
      this.usuarioLogeado = this.authService.sesion;
      this.enviado = false;

      const modalElement = document.getElementById('modalDireccion');
      if (modalElement) {
        const bootstrap = (window as any).bootstrap;
        if (bootstrap) {
          const modalInstancia = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstancia.hide();
        }
      }

      setTimeout(() => this.mensajeAlert = null, 3000);
    } else {
      this.mensajeAlert = resultado.mensaje;
    }
  }


}
