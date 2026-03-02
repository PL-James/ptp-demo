import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskTerminalComponent } from './task-terminal.component';

describe('TaskTerminalComponent', () => {
  let component: TaskTerminalComponent;
  let fixture: ComponentFixture<TaskTerminalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskTerminalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
