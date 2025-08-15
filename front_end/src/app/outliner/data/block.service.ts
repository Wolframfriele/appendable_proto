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
  mergeMap,
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
          .post("/api/blocks", mapToBlockJson(block), this.AS_JSON_HEADERS)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    const blockEdited$ = this.edit$.pipe(
      mergeMap((block) => {
        console.log(`Updated block: ${block}`);
        return this.http
          .put(
            `/api/blocks/${block.id}`,
            mapToBlockJson(block),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    const blockRemoved$ = this.remove$.pipe(
      concatMap((removeBlock) => {
        console.log(`Deleted block: ${removeBlock}`);
        return this.http
          .delete(`/api/blocks/${removeBlock.id}`)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    // reducers
    merge(
      blockAdded$,
      blockEdited$,
      blockRemoved$,
      this.dateRangeService.dateRangeExpanded$,
    )
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
        case Command.MOVE_TO_PREVIOUS_BLOCK:
          this.moveToPreviousBlock();
          break;
        case Command.MOVE_TO_NEXT_BLOCK:
          this.moveToNextBlock();
          break;
        case Command.DELETE_ACTIVE_BLOCK:
          this.deleteActiveBlock();
          break;
      }
    });
  }

  public setActive(idx: number) {
    if (idx >= 0 && idx <= this.state().blocks.length) {
      this.state.update((state) => ({
        ...state,
        activeIdx: idx,
      }));
    }
  }

  public get activeId(): number {
    return this.blocks()[this.activeIdx()].id;
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
    this.setActive(0);
  }

  private moveToPreviousBlock() {
    if (this.state().activeIdx > 0) {
      this.state.update((state) => ({
        ...state,
        activeIdx: state.activeIdx - 1,
      }));
    }
  }

  private moveToNextBlock() {
    if (this.state().activeIdx < this.state().blocks.length - 1) {
      this.state.update((state) => ({
        ...state,
        activeIdx: state.activeIdx + 1,
      }));
    }
  }

  private deleteActiveBlock() {
    this.remove$.next({ id: this.activeId });
  }
}
