import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
  });
  /**
   * 1. Prueba de instanciación base
   * Verifica que el componente estructural App se monte correctamente en memoria.
   */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  /**
   * 2. Prueba de existencia del Header
   * Confirma que la etiqueta del componente Header esté presente en el DOM.
   */
  it('should render the app-header component', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(); // Fuerza el ciclo de detección de cambios para renderizar el HTML
    const headerElement = fixture.debugElement.query(By.css('app-header'));
    expect(headerElement).toBeTruthy();
  });
  /**
   * 3. Prueba de existencia del Router Outlet
   * Asegura que el contenedor dinámico de vistas esté listo para recibir las rutas.
   */
  it('should contain a router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const routerOutletElement = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutletElement).toBeTruthy();
  });
  /**
   * 4. Prueba de existencia del Footer
   * Confirma que la etiqueta del componente Footer esté presente al fondo de la estructura.
   */
  it('should render the app-footer component', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const footerElement = fixture.debugElement.query(By.css('app-footer'));
    expect(footerElement).toBeTruthy();
  });
});
