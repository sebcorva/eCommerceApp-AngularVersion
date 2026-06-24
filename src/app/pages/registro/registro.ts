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
 * Componente para la creación de nuevas cuentas de clientes.
 * Administra un formulario reactivo con validaciones avanzadas en tiempo real para contraseñas, 
 * edad mínima requerida y duplicidad de credenciales interactuando con el `DataService`.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  /** Formulario reactivo principal que agrupa y valida los campos de registro. */
  formularioRegistro: FormGroup;

  /** Flag de control para identificar si el usuario presionó el botón de enviar. */
  enviado = false;

  /** Estado para desplegar alertas de éxito o error en la interfaz de usuario. */
  mensajeAlert: MensajeVista | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dataService: DataService,
    private readonly router: Router
  ) {
    this.formularioRegistro = this.fb.group({
      nombre: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.validarEdadMinima(13)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // Exige al menos 1 Mayúscula y 1 Número
      ]],
      password2: ['', [Validators.required]],
      direccion: ['']
    }, {
      validators: this.repetirPasswordValidator
    });
  }

  /**
   * Getter que simplifica el mapeo y acceso directo a los controles del formulario en el HTML template.
   * @returns {{ [key: string]: AbstractControl }} Diccionario asociativo de controles.
   */
  get controles(): { [key: string]: AbstractControl } {
    return this.formularioRegistro.controls;
  }

  /**
   * Determina si un campo específico cumple con las condiciones para renderizar un aviso visual de error.
   * @param {string} nombreCampo Nombre interno del control a evaluar.
   * @returns {boolean} `true` si el campo está corrupto/inválido y el usuario ya interactuó o intentó enviar el formulario.
   */
  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioRegistro.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  /**
   * Validador personalizado (*Factory Function*) que calcula la edad cronológica basándose en la fecha actual.
   * @param {number} edadMinima Edad límite requerida para el registro de la cuenta.
   * @returns {(control: AbstractControl) => ValidationErrors | null} Función validadora para Reactive Forms.
   * @private
   */
  private validarEdadMinima(edadMinima: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const fechaNac = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }

      return edad >= edadMinima ? null : { menorDeEdad: true };
    };
  }

  /**
   * Validador asíncrono-estructural a nivel de FormGroup que compara la igualdad de las contraseñas ingresadas.
   * Si no coinciden, inyecta el error de forma explícita en el control secundario (`password2`).
   * @param {AbstractControl} group Instancia del grupo de control raíz del formulario.
   * @returns {ValidationErrors | null} Error de coincidencia `{ noCoincide: true }` o `null` si pasa la prueba.
   * @private
   */
  private repetirPasswordValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('password2')?.value;

    if (pass !== confirmPass) {
      group.get('password2')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  /**
   * Ejecuta el proceso de guardado del nuevo usuario.
   * Realiza validaciones reactivas globales, intercepta colisiones de `username` o `email` en la persistencia local,
   * asigna un ID único secuencial y redirige al usuario hacia el Login tras confirmar el éxito.
   * @returns {void}
   */
  onRegistro(): void {
    this.enviado = true;

    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      this.mensajeAlert = { tipo: 'danger', texto: 'Por favor, completa el formulario correctamente.' };
      return;
    }

    const formValues = this.formularioRegistro.getRawValue();
    const usuariosActuales = this.dataService.getUsuarios();

    if (usuariosActuales.some(u => u.username.toLowerCase() === formValues.username.trim().toLowerCase())) {
      this.controles['username'].setErrors({ duplicado: true });
      this.mensajeAlert = { tipo: 'danger', texto: 'El nombre de usuario ya está registrado.' };
      return;
    }

    if (usuariosActuales.some(u => u.email.toLowerCase() === formValues.email.trim().toLowerCase())) {
      this.controles['email'].setErrors({ duplicado: true });
      this.mensajeAlert = { tipo: 'danger', texto: 'El correo electrónico ya está registrado.' };
      return;
    }

    const nuevoId = this.dataService.generarId(usuariosActuales as unknown as Array<{ id: number }>);

    const nuevoUsuario: Usuario = {
      id: nuevoId,
      nombre: formValues.nombre.trim(),
      fechaNacimiento: formValues.fechaNacimiento,
      email: formValues.email.trim(),
      direccion: formValues.direccion.trim(),
      username: formValues.username.trim(),
      password: formValues.password,
      role: 'cliente'
    };

    usuariosActuales.push(nuevoUsuario);
    this.dataService.guardarUsuarios(usuariosActuales);

    alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
    this.router.navigate(['/login']);
  }

  /**
   * Borra el estado de interactividad del formulario, resetea todos los valores nativos de los controles a vacío y oculta las alertas de la interfaz.
   * @returns {void}
   */
  limpiar(): void {
    this.formularioRegistro.reset();
    this.enviado = false;
    this.mensajeAlert = null;
  }
}