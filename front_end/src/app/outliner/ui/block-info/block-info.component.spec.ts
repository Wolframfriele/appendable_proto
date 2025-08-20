import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BlockInfoComponent } from "./block-info.component";

describe("BlockInfoComponent", () => {
  let component: BlockInfoComponent;
  let fixture: ComponentFixture<BlockInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
