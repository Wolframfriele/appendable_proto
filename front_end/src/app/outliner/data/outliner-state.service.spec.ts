import { TestBed } from '@angular/core/testing';

import { OutlinerStateService } from './outliner-state.service';

describe('OutlinerStateService', () => {
  let service: OutlinerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutlinerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
