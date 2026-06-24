import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { MensajeVista, Sesion, Usuario } from './modelos';
import { ValidacionService } from './validacion.service';

/**
 * authService esta encargado de gestionar los procesos de autenticación, sesión y perfil del usuario.
 * Provee herramientas para iniciar sesión, registrarse, recuperar accesos y validar los roles dentro del sistema aniMug.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private readonly data: DataService,
        private readonly validacion: ValidacionService
    ) { }

    /**
     * Obtiene los datos de la sesión activa desde el almacenamiento local.
     * @returns {Sesion | null} El objeto con la sesión activa del usuario o `null` si no hay sesión.
     */
    get sesion(): Sesion | null {
        return this.data.getSesion();
    }

    /**
     * Evalúa el estado de autenticación actual del usuario.
     * @returns {boolean} `true` si el usuario tiene una sesión iniciada; de lo contrario, `false`.
     */
    get autenticado(): boolean {
        return !!this.sesion;
    }

    /**
     * Verifica si el usuario logueado posee el rol de cliente.
     * @returns {boolean} `true` si el rol de la sesión actual es 'cliente'.
     */
    get esCliente(): boolean {
        return this.sesion?.role === 'cliente';
    }

    /**
     * Devuelve verdadero si el usuario activo es administrador.
     * @returns {boolean} `true` si el rol de la sesión actual es 'admin'.
     */
    get esAdmin(): boolean {
        return this.sesion?.role === 'admin';
    }

    /**
     * Maneja la lógica de inicio de sesión de aniMug.
     * @param email Correo electrónico del usuario.
     * @param password Contraseña del usuario.
     * @returns {Object} Objeto con el resultado de la operación y mensaje informativo.
     */
    login(email: string, password: string): { ok: boolean; mensaje: MensajeVista; usuario?: Usuario } {
        if (!this.validacion.validarEmail(email) || this.validacion.estaVacio(password)) {
            return {
                ok: false,
                mensaje: { tipo: 'danger', texto: 'Ingresa un correo válido y una contraseña.' }
            };
        }

        const usuario = this.data.getUsuarioPorEmail(email);

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

    /**
     * Ejecuta el registro de un nuevo cliente aplicando reglas de negocio y validación de duplicados.
     * * @param {Object} datos Estructura con la información requerida del nuevo cliente.
     * @param {string} datos.nombre Nombre completo del usuario.
     * @param {string} datos.username Nombre de usuario único para la plataforma.
     * @param {string} datos.email Correo electrónico único del usuario.
     * @param {string} datos.password Contraseña que cumpla los criterios de seguridad mínimos.
     * @param {string} datos.repetirPassword Confirmación de contraseña para evitar errores de tipeo.
     * @param {string} datos.fechaNacimiento Fecha en formato string para validar la edad mínima.
     * @param {string} datos.direccion Dirección física para despachos de productos.
     * @returns {Object} Objeto indicando el resultado del registro (`ok`) y su respectivo `mensaje`.
     */
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
        const emailExiste = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase());
        if (emailExiste) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este correo ya está registrado.' } };
        }
        const usuarioExiste = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase());
        if (usuarioExiste) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'El nombre de usuario ya está en uso.' } };
        }

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

    /**
     * Simula la búsqueda y envío de un enlace de recuperación de contraseña.
     * * @param {string} email El correo que se desea recuperar.
     * @returns {Object} Objeto con la respuesta informativa del estado del correo.
     */
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

    /**
     * Modifica los datos del perfil del usuario en sesión, resolviendo colisiones de datos y migrando
     * elementos dinámicos (como el carrito de compras) si se edita el email principal.
     * * @param {Object} datos Campos actualizados del perfil.
     * @param {string} datos.nombre Nombre actualizado del usuario.
     * @param {string} datos.username Nombre de usuario (nickname) modificado.
     * @param {string} datos.email Nuevo correo electrónico asociado.
     * @param {string} datos.fechaNacimiento Fecha de nacimiento modificada.
     * @param {string} datos.direccion Nueva ubicación de despacho.
     * @returns {Object} Resultado exitoso o fallido junto con el mensaje descriptivo del error/éxito.
     */
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

        const EmailUsado = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase() && Number(u.id) !== Number(usuario.id));
        if (EmailUsado) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este correo ya está siendo usado por otra cuenta.' } };
        }

        const usernameUsado = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase() && Number(u.id) !== Number(usuario.id));
        if (usernameUsado) {
            return { ok: false, mensaje: { tipo: 'danger', texto: 'Este nombre de usuario ya está ocupado.' } };
        }

        const emailAnterior = usuario.email;

        usuario.nombre = datos.nombre.trim();
        usuario.username = datos.username.trim();
        usuario.email = datos.email.trim().toLowerCase();
        usuario.fechaNacimiento = datos.fechaNacimiento;
        usuario.direccion = datos.direccion.trim();

        this.data.guardarUsuarios(usuarios);
        this.data.guardarSesion(usuario);

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

    /**
     * Termina de forma permanente el estado de la sesión actual removiendo las credenciales del almacenamiento local.
     * @returns {void}
     */
    cerrarSesion(): void {
        this.data.cerrarSesion();
    }
}