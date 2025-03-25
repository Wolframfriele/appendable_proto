import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationEstimateComponent } from './duration-estimate.component';

describe('DurationEstimateComponent', () => {
  let component: DurationEstimateComponent;
  let fixture: ComponentFixture<DurationEstimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationEstimateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
