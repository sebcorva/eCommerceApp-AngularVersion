import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { DataService } from './data.service';
import { ValidacionService } from './validacion.service';
import { MensajeVista, TipoMensaje } from '../models/mensaje-vista';
import { Sesion } from '../models/sesion';
import { Usuario } from '../models/usuario';

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
        return this.data.sesionSignal();
    }

    /**
     * Evalúa el estado de autenticación actual del usuario.
     * @returns {boolean} `true` si el usuario tiene una sesión iniciada; de lo contrario, `false`.
     */
    get autenticado(): boolean {
        return !!this.data.sesionSignal();
    }

    /**
     * Verifica si el usuario logueado posee el rol de cliente.
     * @returns {boolean} `true` si el rol de la sesión actual es 'cliente'.
     */
    get esCliente(): boolean {
        return this.data.sesionSignal()?.role === 'cliente';
    }

    /**
     * Devuelve verdadero si el usuario activo es administrador.
     * @returns {boolean} `true` si el rol de la sesión actual es 'admin'.
     */
    get esAdmin(): boolean {
        return this.data.sesionSignal()?.role === 'admin';
    }

    /**
     * Maneja la lógica de inicio de sesión de aniMug.
     * @param email Correo electrónico del usuario.
     * @param password Contraseña del usuario.
     * @returns {Observable<Object>} Observable con el resultado de la operación y mensaje informativo.
     */
    login(email: string, password: string): Observable<{ ok: boolean; mensaje: MensajeVista; usuario?: Usuario }> {
        if (!this.validacion.validarEmail(email) || this.validacion.estaVacio(password)) {
            return of({
                ok: false,
                mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Ingresa un correo válido y una contraseña.' }
            });
        }

        return this.data.getUsuarioPorEmail(email).pipe(
            map(usuario => {
                if (!usuario || usuario.password !== password) {
                    return {
                        ok: false,
                        mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Correo o contraseña incorrectos.' }
                    };
                }

                this.data.guardarSesion(usuario);

                return {
                    ok: true,
                    usuario,
                    mensaje: { tipo: 'success' as TipoMensaje, texto: `¡Bienvenido ${usuario.username}! Redirigiendo...` }
                };
            }),
            catchError(() => of({
                ok: false,
                mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al conectar con el servidor.' }
            }))
        );
    }

    /**
     * Ejecuta el registro de un nuevo cliente aplicando reglas de negocio y validación de duplicados.
     * @param {Object} datos Estructura con la información requerida del nuevo cliente.
     * @param {string} datos.nombre Nombre completo del usuario.
     * @param {string} datos.username Nombre de usuario único para la plataforma.
     * @param {string} datos.email Correo electrónico único del usuario.
     * @param {string} datos.password Contraseña que cumpla los criterios de seguridad mínimos.
     * @param {string} datos.repetirPassword Confirmación de contraseña para evitar errores de tipeo.
     * @param {string} datos.fechaNacimiento Fecha de nacimiento del usuario.
     * @param {string} datos.direccion Dirección física para despachos de productos.
     * @returns {Observable<Object>} Observable indicando el resultado del registro (`ok`) y su respectivo `mensaje`.
     */
    registrar(datos: {
        nombre: string;
        username: string;
        email: string;
        password: string;
        repetirPassword: string;
        fechaNacimiento: string;
        direccion: string;
    }): Observable<{ ok: boolean; mensaje: MensajeVista }> {
        if (!this.validacion.validarTexto(datos.nombre, 4)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Ingresa un nombre completo válido.' } });
        }
        if (!this.validacion.validarTexto(datos.username, 4)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Ingresa un nombre de usuario de al menos 4 caracteres.' } });
        }
        if (!this.validacion.validarEmail(datos.email)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Ingresa un correo válido.' } });
        }
        if (!this.validacion.validarEdadMinima(datos.fechaNacimiento, 13)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Debes tener al menos 13 años para registrarte.' } });
        }
        const ResultadoPassword = this.validacion.validarPassword(datos.password);
        if (!ResultadoPassword.valida) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'La contraseña no cumple todos los requisitos de seguridad.' } });
        }
        if (datos.password !== datos.repetirPassword) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Las contraseñas no coinciden.' } });
        }

        return this.data.getUsuarios().pipe(
            switchMap(usuarios => {
                const emailExiste = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase());
                if (emailExiste) {
                    return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Este correo ya está registrado.' } });
                }
                const usuarioExiste = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase());
                if (usuarioExiste) {
                    return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'El nombre de usuario ya está en uso.' } });
                }

                const nuevoUsuario: Omit<Usuario, 'id'> = {
                    nombre: datos.nombre.trim(),
                    username: datos.username.trim(),
                    email: datos.email.trim().toLowerCase(),
                    password: datos.password,
                    fechaNacimiento: datos.fechaNacimiento,
                    direccion: datos.direccion.trim(),
                    role: 'cliente'
                };

                return this.data.guardarUsuarios(nuevoUsuario).pipe(
                    map(() => ({
                        ok: true,
                        mensaje: {
                            tipo: 'success' as TipoMensaje,
                            texto: 'Registro completado con éxito. Ahora puedes iniciar sesión.'
                        }
                    })),
                    catchError(() => of({
                        ok: false,
                        mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al registrar el usuario en el servidor.' }
                    }))
                );
            }),
            catchError(() => of({
                ok: false,
                mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al conectar con el servidor.' }
            }))
        );
    }

    /**
     * Simula la búsqueda y envío de un enlace de recuperación de contraseña.
     * @param {string} email El correo que se desea recuperar.
     * @returns {Observable<Object>} Observable con la respuesta informativa del estado del correo.
     */
    recuperar(email: string): Observable<{ ok: boolean; mensaje: MensajeVista }> {
        if (!this.validacion.validarEmail(email)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Ingresa un correo válido.' } });
        }

        return this.data.getUsuarioPorEmail(email).pipe(
            map(usuario => {
                if (!usuario) {
                    return {
                        ok: false,
                        mensaje: { tipo: 'warning' as TipoMensaje, texto: 'No existe ninguna cuenta asociada a este correo.' }
                    };
                }

                return {
                    ok: true,
                    mensaje: {
                        tipo: 'success' as TipoMensaje,
                        texto: 'Simulación exitosa: Se ha enviado un enlace de recuperación a su bandeja de entrada.'
                    }
                };
            }),
            catchError(() => of({
                ok: false,
                mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al conectar con el servidor.' }
            }))
        );
    }

    /**
     * Modifica los datos del perfil del usuario en sesión, resolviendo colisiones de datos y migrando
     * elementos dinámicos (como el carrito de compras) si se edita el email principal.
     * @param {Object} datos Campos actualizados del perfil.
     * @param {string} datos.nombre Nombre actualizado del usuario.
     * @param {string} datos.username Nombre de usuario (nickname) modificado.
     * @param {string} datos.email Nuevo correo electrónico asociado.
     * @param {string} datos.fechaNacimiento Fecha de nacimiento modificada.
     * @param {string} datos.direccion Nueva ubicación de despacho.
     * @returns {Observable<Object>} Observable con el resultado exitoso o fallido junto con el mensaje descriptivo.
     */
    actualizarPerfil(datos: {
        nombre: string;
        username: string;
        email: string;
        fechaNacimiento: string;
        direccion: string;
    }): Observable<{ ok: boolean; mensaje: MensajeVista }> {
        const sesion = this.sesion;

        if (!sesion) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'No hay ninguna sesión activa.' } });
        }

        if (!this.validacion.validarTexto(datos.nombre, 4) ||
            !this.validacion.validarTexto(datos.username, 4) ||
            !this.validacion.validarEmail(datos.email)) {
            return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Por favor, revise los campos marcados.' } });
        }

        return this.data.getUsuarios().pipe(
            switchMap(usuarios => {
                const usuario = usuarios.find(u => String(u.id) === String(sesion.id));

                if (!usuario) {
                    return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'No se encontró el usuario actual en el sistema.' } });
                }

                const EmailUsado = usuarios.some(u => u.email.toLowerCase() === datos.email.trim().toLowerCase() && String(u.id) !== String(usuario.id));
                if (EmailUsado) {
                    return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Este correo ya está siendo usado por otra cuenta.' } });
                }

                const usernameUsado = usuarios.some(u => u.username.toLowerCase() === datos.username.trim().toLowerCase() && String(u.id) !== String(usuario.id));
                if (usernameUsado) {
                    return of({ ok: false, mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Este nombre de usuario ya está ocupado.' } });
                }

                const emailAnterior = usuario.email;

                const usuarioActualizado: Usuario = {
                    ...usuario,
                    nombre: datos.nombre.trim(),
                    username: datos.username.trim(),
                    email: datos.email.trim().toLowerCase(),
                    fechaNacimiento: datos.fechaNacimiento,
                    direccion: datos.direccion.trim()
                };

                return this.data.actualizarUsuario(usuarioActualizado).pipe(
                    map(() => {
                        if (emailAnterior !== usuarioActualizado.email) {
                            const carritos = this.data.getCarritos();
                            if (carritos[emailAnterior] && !carritos[usuarioActualizado.email]) {
                                carritos[usuarioActualizado.email] = carritos[emailAnterior];
                                delete carritos[emailAnterior];
                                this.data.guardarCarritos(carritos);
                            }
                        }

                        this.data.guardarSesion(usuarioActualizado);

                        return { ok: true, mensaje: { tipo: 'success' as TipoMensaje, texto: '¡Perfil actualizado con éxito!' } };
                    }),
                    catchError(() => of({
                        ok: false,
                        mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al actualizar el usuario en el servidor.' }
                    }))
                );
            }),
            catchError(() => of({
                ok: false,
                mensaje: { tipo: 'danger' as TipoMensaje, texto: 'Error al conectar con el servidor.' }
            }))
        );
    }

    /**
     * Termina de forma permanente el estado de la sesión actual removiendo las credenciales del almacenamiento local.
     * @returns {void}
     */
    cerrarSesion(): void {
        this.data.cerrarSesion();
    }
}