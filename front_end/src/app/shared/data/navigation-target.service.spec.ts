import { TestBed } from "@angular/core/testing";

import { ActiveRouteService } from "./active-elements.service";

describe("ActiveElementsService", () => {
  let service: ActiveRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveRouteService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
