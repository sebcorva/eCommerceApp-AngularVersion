/// <reference types="jasmine" />
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Registro } from './registro';
import { DataService } from '../../services/data.service';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../services/modelos';
import { vi } from 'vitest';

class DataServiceMock {
  getUsuarios(): Usuario[] {
    return [
      {
        id: 1,
        nombre: 'Usuario Existente',
        fechaNacimiento: '2000-01-01',
        email: 'duplicado@animug.com',
        username: 'existente123',
        password: 'Password1',
        direccion: '',
        role: 'cliente'
      }
    ];
  }

  generarId(usuarios: any[]): number {
    return usuarios.length + 1;
  }

  guardarUsuarios(usuarios: Usuario[]): void {
  }
}

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Registro,
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forRoot([
          { path: 'login', redirectTo: '' },
          { path: '', redirectTo: '', pathMatch: 'full' }
        ])
      ],
      providers: [
        {
          provide: DataService,
          useClass: DataServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    vi.spyOn(window, 'alert').mockImplementation(() => { });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe procesar el registro con éxito si el formulario es válido', () => {
    component.formularioRegistro.controls['nombre'].setValue('Natsu Dragneel');
    component.formularioRegistro.controls['fechaNacimiento'].setValue('2010-01-01');
    component.formularioRegistro.controls['email'].setValue('natsu@animug.com');
    component.formularioRegistro.controls['username'].setValue('salamander');
    component.formularioRegistro.controls['password'].setValue('Password123');
    component.formularioRegistro.controls['password2'].setValue('Password123');
    component.formularioRegistro.controls['direccion'].setValue('Magnolia');

    component.onRegistro();

    expect(component.formularioRegistro.valid).toBe(true);
    expect(window.alert).toHaveBeenCalledWith('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe ser inválido y mostrar alerta si el formulario está vacío', () => {
    component.onRegistro();

    expect(component.formularioRegistro.valid).toBe(false);
    expect(component.mensajeAlert?.tipo).toBe('danger');
    expect(component.mensajeAlert?.texto).toBe('Por favor, completa el formulario correctamente.');
  });

  it('debe invalidar la contraseña si no contiene un número', () => {
    const password = component.formularioRegistro.controls['password'];

    password.setValue('SoloLetras');

    expect(password.valid).toBe(false);
    expect(password.hasError('pattern')).toBe(true);
  });

  it('debe invalidar la fecha de nacimiento si el usuario es menor de 13 años', () => {
    const fechaNacimiento = component.formularioRegistro.controls['fechaNacimiento'];

    const añoInvalido = new Date().getFullYear() - 5;
    fechaNacimiento.setValue(`${añoInvalido}-05-15`);

    expect(fechaNacimiento.valid).toBe(false);
    expect(fechaNacimiento.hasError('menorDeEdad')).toBe(true);
  });
});
