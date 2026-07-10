import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioPanel } from './usuario-panel';

describe('UsuarioPanel', () => {
  let component: UsuarioPanel;
  let fixture: ComponentFixture<UsuarioPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
