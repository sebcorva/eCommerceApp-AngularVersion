import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioPanel } from './usuario-panel';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

class AuthServiceMock {
  sesion = { id: 99, email: 'admin@example.com' };
}

class DataServiceMock {
  getUsuarios() {
    return of([]);
  }
}

describe('UsuarioPanel', () => {
  let component: UsuarioPanel;
  let fixture: ComponentFixture<UsuarioPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioPanel],
      providers: [
        { provide: DataService, useClass: DataServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
