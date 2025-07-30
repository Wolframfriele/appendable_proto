import { TestBed } from '@angular/core/testing';

import { ActiveEntryService } from './active-entry.service';

describe('ActiveEntryService', () => {
  let service: ActiveEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
