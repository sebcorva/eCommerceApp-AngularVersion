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
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  formularioRegistro: FormGroup;
  enviado = false;
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
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      password2: ['', [Validators.required]],
      direccion: ['']
    }, {
      validators: this.repetirPasswordValidator
    });
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.formularioRegistro.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioRegistro.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  //Validacion de Edad Mínima
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

  //Validacion de Coincidencia de Contraseñas
  private repetirPasswordValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('password2')?.value;

    if (pass !== confirmPass) {
      group.get('password2')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  onRegistro(): void {
    this.enviado = true;

    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      this.mensajeAlert = { tipo: 'danger', texto: 'Por favor, completa el formulario correctamente.' };
      return;
    }

    const formValues = this.formularioRegistro.getRawValue();

    const usuariosActuales = this.dataService.getUsuarios();

    // Validar si el Username ya existe
    if (usuariosActuales.some(u => u.username.toLowerCase() === formValues.username.trim().toLowerCase())) {
      this.controles['username'].setErrors({ duplicado: true });
      this.mensajeAlert = { tipo: 'danger', texto: 'El nombre de usuario ya está registrado.' };
      return;
    }

    // Validar si el Email ya existe
    if (usuariosActuales.some(u => u.email.toLowerCase() === formValues.email.trim().toLowerCase())) {
      this.controles['email'].setErrors({ duplicado: true });
      this.mensajeAlert = { tipo: 'danger', texto: 'El correo electrónico ya está registrado.' };
      return;
    }

    // Generar el nuevo ID de usuario
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

  limpiar(): void {
    this.formularioRegistro.reset();
    this.enviado = false;
    this.mensajeAlert = null;
  }
}
