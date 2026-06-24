import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Categoria } from './categoria';

describe('Categoria', () => {
  let component: Categoria;
  let fixture: ComponentFixture<Categoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categoria], 
      providers: [
        provideRouter([]) 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Categoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
