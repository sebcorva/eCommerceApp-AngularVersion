/// <reference types="jasmine" />

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

class AuthServiceMock {
  autenticado = false;
  sesion = null;

  login(email: string, clave: string) {
    if (email === 'ejemplo@animug.com' && clave === 'ClaveValida123') {
      return {
        ok: true,
        mensaje: null
      };
    }
    return {
      ok: false,
      mensaje: {
        tipo: 'danger',
        texto: 'Contraseña incorrecta.'
      }
    };
  }
}

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Login,
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forRoot([{ path: 'login', redirectTo: '' }])
      ],
      providers: [
        {
          provide: AuthService,
          useClass: AuthServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe ser inválido si el formulario está vacío', () => {
    expect(component.formularioLogin.valid).toBe(false);
  });

  it('debe invalidar el correo si no tiene formato válido', () => {
    const correo = component.formularioLogin.controls['email'];

    correo.setValue('correo-malo');

    expect(correo.valid).toBe(false);
    expect(correo.hasError('email')).toBe(true);
  });

  it('debe iniciar sesión con éxito cuando las credenciales existen', () => {
    component.formularioLogin.controls['email'].setValue('ejemplo@animug.com');
    component.formularioLogin.controls['password'].setValue('ClaveValida123');

    component.onSubmit();

    expect(component.mensajeAlert).toBeNull();
  });

  it('debe bloquear el acceso y activar la alerta si la contraseña es incorrecta', () => {
    component.formularioLogin.controls['email'].setValue('ejemplo@animug.com');
    component.formularioLogin.controls['password'].setValue('clave_incorrecta');

    component.onSubmit();

    expect(component.mensajeAlert?.tipo).toBe('danger');
    expect(component.mensajeAlert?.texto).toBe('Contraseña incorrecta.');
  });
});
