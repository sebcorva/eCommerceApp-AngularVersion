export type TipoMensaje = 'success' | 'danger' | 'warning' | 'info';

export interface MensajeVista {
    tipo: TipoMensaje;
    texto: string;
}