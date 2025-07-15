import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinerComponent } from './outliner.component';

describe('OutlinerComponent', () => {
  let component: OutlinerComponent;
  let fixture: ComponentFixture<OutlinerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutlinerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutlinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
