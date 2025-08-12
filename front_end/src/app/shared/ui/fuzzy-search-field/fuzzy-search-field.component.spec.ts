import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuzzySearchFieldComponent } from './fuzzy-search-field.component';

describe('FuzzySearchFieldComponent', () => {
  let component: FuzzySearchFieldComponent;
  let fixture: ComponentFixture<FuzzySearchFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuzzySearchFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuzzySearchFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
