import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollTokenPage } from './enroll-token.page';

describe('EnrollTokenPage', () => {
  let component: EnrollTokenPage;
  let fixture: ComponentFixture<EnrollTokenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollTokenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
