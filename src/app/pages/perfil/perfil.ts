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
import { MensajeVista } from '../../models/mensaje-vista';
import { Sesion } from '../../models/sesion';

/**
* Componente Perfil de usuarios clientes
* Este componente permite ver informacion del usuario logeado y actualizar su direccion de despacho
* Se espera permitir al usuario ver su historial de compras y pedidos en el futuro
*/

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  /**
   * Almacena la información de la sesión del usuario actualmente conectado.
   * Si es `null`, significa que no hay un usuario autenticado.
   */
  usuarioLogeado: Sesion | null = null;
  /**
   * Controla las alertas informativas (éxito o error) que se muestran en la interfaz.
   */
  mensajeAlert: MensajeVista | null = null;

  /**
   * Formulario reactivo para la edición y validación de la dirección del usuario.
   */
  direccionForm: FormGroup;
  /**
   * Flag que indica si el usuario ya intentó enviar/guardar el formulario.
   * Utilizado para forzar la visualización de errores visuales.
   */
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
  /**
   * Ciclo de inicialización. Valida la sesión activa; si no existe, redirige al Login.
   * Si existe, precarga la dirección actual en el formulario.
   */
  ngOnInit(): void {
    if (!this.authService.autenticado) {
      this.router.navigate(['login']);
      return;
    }
    this.usuarioLogeado = this.authService.sesion;
    if (this.usuarioLogeado?.direccion) {
      this.direccionForm.patchValue({
        direccion: this.usuarioLogeado.direccion
      });
    }
  }
  /**
   * Getter que facilita el acceso directo a los controles del formulario desde el HTML.
   */
  get controles(): { [key: string]: AbstractControl } {
    return this.direccionForm.controls;
  }
  /**
   * Evalúa si un campo específico del formulario debe marcarse con error visual.
   * @param nombreCampo Nombre del control a validar dentro del `direccionForm`.
   * @returns `true` si el campo es inválido y ha sido interactuado o el formulario fue enviado.
   */
  campoInvalido(nombreCampo: string): boolean {
    const control = this.direccionForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }
  /**
   * Procesa el envío del formulario de dirección.
   * Si es válido, actualiza el perfil mediante el `AuthService`, refresca la sesión local,
   * cierra el modal de Bootstrap de forma programática y limpia las alertas temporales.
   */
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
