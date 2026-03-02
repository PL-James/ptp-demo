import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeafletsPage } from './leaflets.page';

describe('LeafletPage', () => {
  let component: LeafletsPage;
  let fixture: ComponentFixture<LeafletsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeafletsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
