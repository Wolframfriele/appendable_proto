import { HttpClient, HttpHeaders } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { DateRangeService } from "./date-range.service";
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

  private state = signal<BlockState>({
    blocks: [],
    loaded: false,
    error: null,
  });

  blocks = computed(() => this.state().blocks);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

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
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }
}
