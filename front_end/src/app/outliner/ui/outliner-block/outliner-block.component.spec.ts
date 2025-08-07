import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinerBlockComponent } from './outliner-block.component';

describe('OutlinerBlockComponent', () => {
  let component: OutlinerBlockComponent;
  let fixture: ComponentFixture<OutlinerBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutlinerBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutlinerBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
