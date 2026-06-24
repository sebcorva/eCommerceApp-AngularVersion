import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Carrito } from './carrito';
import { Component } from '@angular/core';

@Component({ template: '' }) class DummyComponent {}

describe('Carrito', () => {
  let component: Carrito;
  let fixture: ComponentFixture<Carrito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carrito], 
      providers: [
        provideRouter([
          { path: 'login', component: DummyComponent}
        ]) 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
