import { HttpClient, HttpHeaders } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { DateRangeService } from "./date-range.service";
import { Command, CommandService } from "../../shared/data/command.service";
import { Block, RemoveBlock } from "../../model/block.model";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import { BlockJson } from "../../model/block.interface";
import { mapToBlockJson, mapToBlocks } from "../../model/block.mapper";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface BlockState {
  blocks: Block[];
  loaded: boolean;
  error: String | null;
  activeIdx: number;
}

@Injectable({
  providedIn: "root",
})
export class BlockService {
  private AS_JSON_HEADERS = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  private http = inject(HttpClient);
  private dateRangeService = inject(DateRangeService);
  private commandService = inject(CommandService);

  private state = signal<BlockState>({
    blocks: [],
    loaded: false,
    error: null,
    activeIdx: 0,
  });

  // selectors
  blocks = computed(() => this.state().blocks);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  activeIdx = computed(() => this.state().activeIdx);

  // sources
  add$ = new Subject<Block>();
  edit$ = new Subject<Block>();
  remove$ = new Subject<RemoveBlock>();

  constructor() {
    const blockAdded$ = this.add$.pipe(
      concatMap((block) => {
        console.log(`Added new block: ${block}`);
        return this.http
          .post(`/api/blocks`, mapToBlockJson(block), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    // reducers
    merge(blockAdded$, this.dateRangeService.dateRangeExpanded$)
      .pipe(
        startWith(null),
        switchMap(() =>
          this.http
            .get<
              BlockJson[]
            >(`/api/blocks?start=${this.dateRangeService.start().toISOString()}`)
            .pipe(catchError((err) => this.handleError(err))),
        ),
        map((json: BlockJson[]) => mapToBlocks(json)),
        takeUntilDestroyed(),
      )
      .subscribe((blocks) => {
        this.state.update((state) => ({
          ...state,
          blocks: blocks.reverse(),
          loaded: true,
        }));
      });

    this.commandService.executeCommand$.subscribe((command) => {
      switch (command) {
        case Command.ADD_NEW_BLOCK:
          this.addNewBlock();
          break;
      }
    });
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  private addNewBlock() {
    this.add$.next({
      id: 0,
      text: "",
      project: undefined,
      projectName: undefined,
      start: new Date(),
      end: undefined,
      duration: 0,
      tags: [],
    });
  }
}
