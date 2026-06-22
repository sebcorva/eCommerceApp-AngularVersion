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

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {

  recuperarForm: FormGroup;
  enviado = false;
  mensajeAlert: MensajeVista | null = null;

  pasoActual = 1;
  usuarioEncontrado: Usuario | null = null;
  instruccionesTexto = 'Ingresa tu correo electrónico para recuperar tu contraseña.';

  constructor(
    private readonly fb: FormBuilder,
    private readonly dataService: DataService,
    private readonly router: Router
  ) {

    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      repeatPassword: ['', [Validators.required]]
    }, {
      validators: this.coincidenPasswordsValidator
    });
  }

  get erroresControles(): { [key: string]: AbstractControl } {
    return this.recuperarForm.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.recuperarForm.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  private coincidenPasswordsValidator(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('newPassword')?.value;
    const repeatPass = group.get('repeatPassword')?.value;

    if (newPass !== repeatPass && repeatPass !== '') {
      group.get('repeatPassword')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  onProcesarRecuperacion(): void {
    this.enviado = true;
    const formValues = this.recuperarForm.getRawValue();

    //1: Validar correo
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
    //2: Cambio de contraseña
    if (this.pasoActual === 2) {
      if (this.recuperarForm.invalid) {
        this.recuperarForm.markAllAsTouched();
        this.mensajeAlert = { tipo: 'danger', texto: 'Por favor, rellena las contraseñas correctamente.' };
        return;
      }

      const usuarios = this.dataService.getUsuarios();
      const index = usuarios.findIndex(u => u.username.toLowerCase() === this.usuarioEncontrado?.username.toLowerCase());

      if (index !== -1) {
        usuarios[index].password = formValues.newPassword;
        this.dataService.guardarUsuarios(usuarios);

        this.dataService.cerrarSesion();

        alert('¡Contraseña actualizada con éxito!');
        this.router.navigate(['/login']);
      } else {
        this.mensajeAlert = { tipo: 'danger', texto: 'Error del sistema al localizar tu cuenta.' };
      }
    }
  }
}
