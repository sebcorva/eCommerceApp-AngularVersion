import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MensajeVista, Usuario } from '../../services/modelos';

/**
 * Componente encargado de gestionar el flujo estructurado para la recuperación de accesos.
 * Permite buscar la existencia de una cuenta por correo electrónico y modificar las 
 * credenciales aplicando los mismos criterios estrictos de seguridad de contraseñas de la plataforma.
 */
@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {

  /** Formulario reactivo que agrupa los campos de validación de correo y contraseñas. */
  recuperarForm: FormGroup;

  /** Flag de control de interactividad al enviar el formulario. */
  enviado = false;

  /** Estado para el despliegue dinámico de alertas contextuales. */
  mensajeAlert: MensajeVista | null = null;

  /** Control del estado del wizard de recuperación (1: Búsqueda por Email, 2: Nueva Contraseña). */
  pasoActual = 1;

  /** Referencia temporal del usuario localizado en el sistema a partir del correo. */
  usuarioEncontrado: Usuario | null = null;

  /** Hilo de texto orientativo para guiar al usuario en la interfaz según el paso actual. */
  instruccionesTexto = 'Ingresa tu correo electrónico para recuperar tu contraseña.';

  constructor(
    private readonly fb: FormBuilder,
    private readonly dataService: DataService,
    private readonly router: Router
  ) {

    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // Igualado a Registro: Exige al menos 1 Mayúscula y 1 Número
      ]],
      repeatPassword: ['', [Validators.required]]
    }, {
      validators: this.coincidenPasswordsValidator
    });
  }

  /**
   * Getter que simplifica el mapeo y acceso directo a los controles del formulario en el HTML template.
   * @returns {{ [key: string]: AbstractControl }} Diccionario asociativo de controles y errores.
   */
  get erroresControles(): { [key: string]: AbstractControl } {
    return this.recuperarForm.controls;
  }

  /**
   * Evalúa si un campo de formulario reactivo posee un estado inválido tras haber sido alterado o enviado.
   * @param {string} nombreCampo Nombre interno de la propiedad de control.
   * @returns {boolean} `true` si el control se corrompió bajo criterios de validación.
   */
  campoInvalido(nombreCampo: string): boolean {
    const control = this.recuperarForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  /**
   * Validador estructural a nivel de FormGroup que verifica la perfecta concordancia de las contraseñas secundarias.
   * Si detecta discrepancia, inyecta explícitamente la llave de error en el control objetivo (`repeatPassword`).
   * @param {AbstractControl} group Instancia del FormGroup raíz.
   * @returns {ValidationErrors | null} Error `{ noCoincide: true }` o `null` si los datos concuerdan.
   * @private
   */
  private coincidenPasswordsValidator(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('newPassword')?.value;
    const repeatPass = group.get('repeatPassword')?.value;

    if (newPass !== repeatPass && repeatPass !== '') {
      group.get('repeatPassword')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  /**
   * Procesamiento cíclico de los pasos de recuperación:
   * **Paso 1:** Filtra y confirma que el correo electrónico pertenezca a un cliente de aniMug.
   * **Paso 2:** Aplica las validaciones del formulario sobre la nueva clave, persiste cambios y fuerza el cierre de sesiones previas.
   * @returns {void}
   */
  onProcesarRecuperacion(): void {
    this.enviado = true;
    const formValues = this.recuperarForm.getRawValue();

    // 1: Validar existencia de correo electrónico
    if (this.pasoActual === 1) {
      const emailControl = this.recuperarForm.get('email');

      if (!emailControl || emailControl.invalid) {
        this.mensajeAlert = { tipo: 'danger', texto: 'Por favor, ingresa un formato de correo válido.' };
        return;
      }

      const correoIngresado = formValues.email.trim().toLowerCase();
      const usuarios = this.dataService.getUsuarios();

      this.usuarioEncontrado = usuarios.find(u => u.email && u.email.toLowerCase() === correoIngresado) || null;

      if (!this.usuarioEncontrado) {
        emailControl.setErrors({ noRegistrado: true });
        this.mensajeAlert = { tipo: 'danger', texto: 'Este correo electrónico no está registrado en aniMug.' };
        return;
      }

      this.instruccionesTexto = `Hola ${this.usuarioEncontrado.username}, ingresa tu nueva contraseña:`;
      this.mensajeAlert = null;
      this.enviado = false;
      this.pasoActual = 2;
      return;
    }

    // 2: Cambio definitivo de credenciales
    if (this.pasoActual === 2) {
      if (this.recuperarForm.invalid) {
        this.recuperarForm.markAllAsTouched();
        this.mensajeAlert = { tipo: 'danger', texto: 'La contraseña no cumple todos los requisitos de seguridad o las contraseñas no coinciden.' };
        return;
      }

      const usuarios = this.dataService.getUsuarios();
      const index = usuarios.findIndex(u => u.username.toLowerCase() === this.usuarioEncontrado?.username.toLowerCase());

      if (index !== -1) {
        usuarios[index].password = formValues.newPassword;
        this.dataService.guardarUsuarios(usuarios);

        // Bloqueo de seguridad: Evita mantener sesiones corruptas antiguas activas.
        this.dataService.cerrarSesion();

        alert('¡Contraseña actualizada con éxito!');
        this.router.navigate(['/login']);
      } else {
        this.mensajeAlert = { tipo: 'danger', texto: 'Error del sistema al localizar tu cuenta.' };
      }
    }
  }
}