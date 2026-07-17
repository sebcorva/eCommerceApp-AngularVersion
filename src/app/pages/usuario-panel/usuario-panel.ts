import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuario-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-panel.html',
  styleUrl: './usuario-panel.css',
})
export class UsuarioPanel implements OnInit {
  listaUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  terminoBusqueda: string = '';

  usuarioForm: FormGroup;
  editandoId: number | null = null;
  enviado = false;
  mostrarFormulario = false;

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fechaNacimiento: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      role: ['cliente', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get controles(): { [key: string]: AbstractControl } {
    return this.usuarioForm.controls;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.usuarioForm.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || control.dirty || this.enviado));
  }

  /**
   * Carga el listado completo de usuarios desde el db.json de forma asíncrona
   */
  cargarUsuarios(): void {
    this.dataService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.listaUsuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar la lista de usuarios:', err)
    });
  }

  /**
   * Filtra dinámicamente la tabla por nombre, apodo o correo electrónico
   */
  filtrarUsuarios(): void {
    const busqueda = this.terminoBusqueda.trim().toLowerCase();
    if (!busqueda) {
      this.usuariosFiltrados = this.listaUsuarios;
    } else {
      this.usuariosFiltrados = this.listaUsuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda) ||
        u.username.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda)
      );
    }
  }

  abrirFormularioCreacion(): void {
    this.cancelarEdicion();
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.mostrarFormulario = true;
    this.cdr.detectChanges();
  }

  activarEdicion(usuario: Usuario): void {
    this.editandoId = usuario.id;
    this.enviado = false;
    this.mostrarFormulario = true;

    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();

    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      password: usuario.password,
      fechaNacimiento: usuario.fechaNacimiento,
      direccion: usuario.direccion,
      role: usuario.role
    });
    this.cdr.detectChanges();
  }

  onGuardarUsuario(): void {
    this.enviado = true;

    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      alert('Por favor, completa el formulario correctamente.');
      return;
    }

    const formValues = this.usuarioForm.getRawValue();

    if (this.editandoId) {
      const usuarioEditado: Usuario = {
        id: Number(this.editandoId),
        nombre: formValues.nombre.trim(),
        username: formValues.username.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        fechaNacimiento: formValues.fechaNacimiento,
        direccion: formValues.direccion.trim(),
        role: formValues.role
      };

      this.dataService.actualizarUsuario(usuarioEditado).subscribe({
        next: () => {
          alert('¡Usuario actualizado con éxito!');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: () => alert('Ocurrió un error al actualizar el usuario.')
      });

    } else {
      // MODO CREACIÓN
      const emailNormalizado = formValues.email.trim().toLowerCase();

      this.dataService.getUsuarios().subscribe({
        next: (usuariosActuales) => {
          if (usuariosActuales.some(u => u.email.toLowerCase() === emailNormalizado)) {
            alert('Este correo electrónico ya está registrado.');
            return;
          }

          const nuevoUsuario: Omit<Usuario, 'id'> = {
            nombre: formValues.nombre.trim(),
            username: formValues.username.trim(),
            email: emailNormalizado,
            password: formValues.password,
            fechaNacimiento: formValues.fechaNacimiento,
            direccion: formValues.direccion.trim(),
            role: formValues.role
          };

          this.dataService.guardarUsuarios(nuevoUsuario).subscribe({
            next: () => {
              alert('¡Usuario creado con éxito!');
              this.cancelarEdicion();
              this.cargarUsuarios();
            },
            error: () => alert('Ocurrió un error al crear el usuario.')
          });
        }
      });
    }
  }

  eliminarUsuario(id: number | string): void {
    if (this.authService.sesion?.id === Number(id)) {
      alert('No puedes eliminar tu propia cuenta de administrador mientras estás en sesión.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.dataService.eliminarUsuarioGlobal(id).subscribe({
        next: () => {
          alert('¡Usuario eliminado con éxito!');
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al intentar borrar el usuario de la API:', err);
          alert('Ocurrió un error al intentar eliminar al usuario.');
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.enviado = false;
    this.mostrarFormulario = false;
    this.usuarioForm.reset({ role: 'cliente' });
    this.cdr.detectChanges();
  }
}
