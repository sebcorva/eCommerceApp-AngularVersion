import { Injectable } from '@angular/core';

export interface ResultadoPassword {
    largoMinimo: boolean;
    largoMaximo: boolean;
    mayuscula: boolean;
    numero: boolean;
    especial: boolean;
    valida: boolean;
}

@Injectable({ providedIn: 'root' })
export class ValidacionService {
    estaVacio(valor: string | null | undefined): boolean {
        return !valor || valor.trim() === '';
    }

    validarEmail(email: string): boolean {
        const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return expresion.test((email || '').trim());
    }

    validarPassword(password: string): ResultadoPassword {
        const valor = password || '';

        return {
            largoMinimo: valor.length >= 8,
            largoMaximo: valor.length <= 18,
            mayuscula: /[A-Z]/.test(valor),
            numero: /\d/.test(valor),
            especial: /[!@#$%&*._-]/.test(valor),
            valida: valor.length >= 8 &&
                valor.length <= 18 &&
                /[A-Z]/.test(valor) &&
                /\d/.test(valor) &&
                /[!@#$%&*._-]/.test(valor)
        };
    }

    validarEdadMinima(fechaNacimiento: string, edadMinima = 13): boolean {
        if (!fechaNacimiento) return false;

        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad >= edadMinima;
    }

    validarTexto(valor: string, minimo = 2): boolean {
        return (valor || '').trim().length >= minimo;
    }

    validarNumeroPositivo(valor: number | string, permiteCero = false): boolean {
        if (valor === null || valor === undefined || valor === '') return false;

        const numero = Number(valor);
        if (Number.isNaN(numero)) return false;

        return permiteCero ? numero >= 0 : numero > 0;
    }
}
