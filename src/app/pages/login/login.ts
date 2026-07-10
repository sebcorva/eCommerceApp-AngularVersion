import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MensajeVista } from '../../models/mensaje-vista';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  //Contenedor principal de formulario reactivo
  formularioLogin: FormGroup;

  //Alertas
  enviado = false;
  mensajeAlert: MensajeVista | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    //construccion del formulario con fb
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  //Getter para un acceso simple al formulario en el html
  get controles(): { [key: string]: AbstractControl } {
    return this.formularioLogin.controls;
  }

  // Método auxiliar para activar estilos de error en el HTML
  campoInvalido(nombreCampo: string): boolean {
    const control = this.formularioLogin.get(nombreCampo);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  onSubmit(): void {
    this.enviado = true;

    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.mensajeAlert = {
        tipo: 'danger',
        texto: 'Por favor, rellena todos los campos correctamente.',
      };
      return;
    }

    //Extraer datos del input
    const { email, password } = this.formularioLogin.getRawValue() as {
      email: string;
      password: string;
    };

    //Ejecucion de login
    this.authService.login(email, password).subscribe({
      next: (resultado) => {
        if (resultado.ok) {
          this.router.navigate(['/']);
        } else {
          this.mensajeAlert = resultado.mensaje;
        }
      },
      error: (err) => {
        this.mensajeAlert = { tipo: 'danger', texto: 'Error al conectar con el servidor.' };
      }
    });
  }

  limpiar(): void {
    this.formularioLogin.reset({
      email: '',
      password: ''
    });
    this.enviado = false;
    this.mensajeAlert = null;
  }
}
