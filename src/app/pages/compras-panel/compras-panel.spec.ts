import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComprasPanel } from './compras-panel';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';

class DataServiceMock {
  getTodasLasCompras() {
    return of([]);
  }
  actualizarEstadoCompra(compra: any) {
    return of(compra);
  }
  eliminarCompraGlobal(id: number | string) {
    return of(void 0);
  }
  formatearPrecio(valor: number) {
    return `$${valor}`;
  }
}

describe('ComprasPanel', () => {
  let component: ComprasPanel;
  let fixture: ComponentFixture<ComprasPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprasPanel],
      providers: [
        { provide: DataService, useClass: DataServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComprasPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
