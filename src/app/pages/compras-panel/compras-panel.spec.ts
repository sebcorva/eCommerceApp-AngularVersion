import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasPanel } from './compras-panel';

describe('ComprasPanel', () => {
  let component: ComprasPanel;
  let fixture: ComponentFixture<ComprasPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprasPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ComprasPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
