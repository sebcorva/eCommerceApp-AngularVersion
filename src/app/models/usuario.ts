import { RolUsuario } from "./sesion";

export interface Usuario {
    id: number;
    nombre: string;
    username: string;
    email: string;
    password: string;
    fechaNacimiento: string;
    direccion: string;
    role: RolUsuario;
}