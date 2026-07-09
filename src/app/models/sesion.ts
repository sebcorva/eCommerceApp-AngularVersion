export type RolUsuario = 'admin' | 'cliente';

export interface Sesion {
    id: number;
    nombre: string;
    username: string;
    email: string;
    fechaNacimiento: string;
    direccion: string;
    role: RolUsuario;
    logueado: boolean;
}
