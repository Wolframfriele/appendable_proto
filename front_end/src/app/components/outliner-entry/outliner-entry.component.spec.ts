import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinerEntryComponent } from './outliner-entry.component';

describe('OutlinerEntryComponent', () => {
  let component: OutlinerEntryComponent;
  let fixture: ComponentFixture<OutlinerEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutlinerEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutlinerEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
