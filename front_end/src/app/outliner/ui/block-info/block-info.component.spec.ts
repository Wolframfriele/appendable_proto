import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryInfoComponent } from './entry-info.component';

describe('EntryInfoComponent', () => {
  let component: EntryInfoComponent;
  let fixture: ComponentFixture<EntryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
