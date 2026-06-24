import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Perfil } from './perfil';
import { Component } from '@angular/core';

@Component({ template: '' }) class DummyComponent {}

describe('Perfil', () => {
  let component: Perfil;
  let fixture: ComponentFixture<Perfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Perfil], 
      providers: [
        provideRouter([
          { path: 'login', component: DummyComponent}
        ]) 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Perfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
