import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandPalleteComponent } from './command-pallete.component';

describe('CommandPalleteComponent', () => {
  let component: CommandPalleteComponent;
  let fixture: ComponentFixture<CommandPalleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPalleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandPalleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
