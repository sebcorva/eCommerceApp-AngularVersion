import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisCompras } from './mis-compras';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

class AuthServiceMock {
  get sesion() {
    return { email: 'test@example.com' };
  }
}

class DataServiceMock {
  getComprasPorUsuario(email: string) {
    return of([]);
  }
  formatearPrecio(valor: number) {
    return `$${valor}`;
  }
}

describe('MisCompras', () => {
  let component: MisCompras;
  let fixture: ComponentFixture<MisCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MisCompras,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: DataService, useClass: DataServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisCompras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
