import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { MensajeVista, Sesion, Usuario } from './modelos';
import { ValidacionService } from './validacion.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private readonly data: DataService,
        private readonly validacion: ValidacionService
    ) { }

    /** Obtiene la sesión activa desde el servicio de datos */
    get sesion(): Sesion | null {
        return this.data.getSesion();
    }

    /** Devuelve verdadero si hay un usuario logueado */
    get autenticado(): boolean {
        return !!this.sesion;
    }

    /** Devuelve verdadero si el usuario activo es cliente */
    get esCliente(): boolean {
        return this.sesion?.role === 'cliente';
    }

    /** Devuelve verdadero si el usuario activo es administrador */
    get esAdmin(): boolean {
        return this.sesion?.role === 'admin';
    }

    /** Maneja la lógica de inicio de sesión de aniMug */
    login(email: string, password: string): { ok: boolean; mensaje: MensajeVista; usuario?: Usuario } {
        if (!this.validacion.validarEmail(email) || this.validacion.estaVacio(password)) {
            return {
                ok: false,
                mensaje: { tipo: 'danger', texto: 'Ingresa un correo válido y una contraseña.' }
            };
        }

        const usuario = this.data.getUsuarioPorEmail(email);

        // En tus modelos el campo se llama "clave"
        if (!usuario || usuario.password !== password) {
            return {
                ok: false,
                mensaje: { tipo: 'danger', texto: 'Correo o contraseña incorrectos.' }
            };
        }

        this.data.guardarSesion(usuario);

        return {
            ok: true,
            usuario,
            mensaje: { tipo: 'success', texto: `¡Bienvenido ${usuario.username}! Redirigiendo...` }
        };
    }

    /** Registra un nuevo cliente en el sistema */
    registrar(datos: {
        nombre: string;
        username: string;
        email: string;
        password: string;
        repetirPassword: string;
        fechaNacimiento: string;
        direccion: string;
    }): { ok: boolean; mensaje: MensajeVista } {
        const usuarios = this.data.getUsuarios();

        // Validaciones del profesor
        if (!this.validacion.validarTexto(datos.nombre, 4)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Ingresa un nombre completo válido.' } };
        }

        if (!this.validacion.validarTexto(datos.username, 4)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Ingresa un nombre de usuario de al menos 4 caracteres.' } };
        }

        if (!this.validacion.validarEmail(datos.email)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Ingresa un correo válido.' } };
        }

        if (!this.validacion.validarEdadMinima(datos.fechaNacimiento, 13)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Debes tener al menos 13 años para registrarte.' } };
        }

        const ResultadoPassword = this.validacion.validarPassword(datos.password);
        if (!ResultadoPassword.valida) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'La contraseña no cumple todos los requisitos de seguridad.' } };
        }

        if (datos.password !== datos.repetirPassword) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Las contraseñas no coinciden.' } };
        }

        // Comprobación de duplicados
        const emailExiste = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase());
        if (emailExiste) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este correo ya está registrado.' } };
        }

        const usuarioExiste = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase());
        if (usuarioExiste) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'El nombre de usuario ya está en uso.' } };
        }

        // Creación del nuevo usuario
        const nuevoUsuario: Usuario = {
            id: this.data.generarId(usuarios),
            nombre: datos.nombre.trim(),
            username: datos.username.trim(),
            email: datos.email.trim().toLowerCase(),
            password: datos.password,
            fechaNacimiento: datos.fechaNacimiento,
            direccion: datos.direccion.trim(),
            role: 'cliente'
        };

        usuarios.push(nuevoUsuario);
        this.data.guardarUsuarios(usuarios);

        return {
            ok: true,
            mensaje: {
                tipo: 'success',
                texto: 'Registro completado con éxito. Ahora puedes iniciar sesión.'
            }
        };
    }

    /** Simula la recuperación de contraseña */
    recuperar(email: string): { ok: boolean; mensaje: MensajeVista } {
        if (!this.validacion.validarEmail(email)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Ingresa un correo válido.' } };
        }

        const usuario = this.data.getUsuarioPorEmail(email);

        if (!usuario) {
            return {
                ok: false,
                mensaje: { tipo: 'warning', texto: 'No existe ninguna cuenta asociada a este correo.' }
            };
        }

        return {
            ok: true,
            mensaje: {
                tipo: 'success',
                texto: 'Simulación exitosa: Se ha enviado un enlace de recuperación a su bandeja de entrada.'
            }
        };
    }

    /** Actualiza los datos del usuario logueado en su perfil */
    actualizarPerfil(datos: {
        nombre: string;
        username: string;
        email: string;
        fechaNacimiento: string;
        direccion: string;
    }): { ok: boolean; mensaje: MensajeVista } {
        const sesion = this.sesion;

        if (!sesion) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'No hay ninguna sesión activa.' } };
        }

        const usuarios = this.data.getUsuarios();
        const usuario = usuarios.find(u => Number(u.id) === Number(sesion.id));

        if (!usuario) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'No se encontró el usuario actual en el sistema.' } };
        }

        if (!this.validacion.validarTexto(datos.nombre, 4) ||
            !this.validacion.validarTexto(datos.username, 4) ||
            !this.validacion.validarEmail(datos.email)) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Por favor, revise los campos marcados.' } };
        }

        // Comprobar que los nuevos datos no choquen con otros usuarios existentes
        const EmailUsado = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase() && Number(u.id) !== Number(usuario.id));
        if (EmailUsado) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este correo ya está siendo usado por otra cuenta.' } };
        }

        const usernameUsado = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase() && Number(u.id) !== Number(usuario.id));
        if (usernameUsado) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este nombre de usuario ya está ocupado.' } };
        }

        const emailAnterior = usuario.email;

        // Guardar cambios
        usuario.nombre = datos.nombre.trim();
        usuario.username = datos.username.trim();
        usuario.email = datos.email.trim().toLowerCase();
        usuario.fechaNacimiento = datos.fechaNacimiento;
        usuario.direccion = datos.direccion.trim();

        this.data.guardarUsuarios(usuarios);
        this.data.guardarSesion(usuario);

        // Mover el carrito al nuevo correo indexado si es que cambió de email
        if (emailAnterior !== usuario.email) {
            const carritos = this.data.getCarritos();
            if (carritos[emailAnterior] && !carritos[usuario.email]) {
                carritos[usuario.email] = carritos[emailAnterior];
                delete carritos[emailAnterior];
                this.data.guardarCarritos(carritos);
            }
        }

        return { ok: true, mensaje: { tipo: 'success', texto: '¡Perfil actualizado con éxito!' } };
    }

    /** Remueve los datos de sesión activos */
    cerrarSesion(): void {
        this.data.cerrarSesion();
    }
}