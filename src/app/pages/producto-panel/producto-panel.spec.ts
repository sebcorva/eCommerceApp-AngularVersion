import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductoPanel } from './producto-panel';

describe('ProductoPanel', () => {
  let component: ProductoPanel;
  let fixture: ComponentFixture<ProductoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoPanel, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
