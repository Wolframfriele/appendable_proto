import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { DateRangeService } from "./date-range.service";
import { Block, RemoveBlock } from "../../model/block.model";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
  mergeMap,
  Observable,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from "rxjs";
import { BlockJson } from "../../model/block.interface";
import { mapToBlockJson, mapToBlocks } from "../../model/block.mapper";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: "root",
})
export class BlockService {
  private http = inject(HttpClient);
  private dateRangeService = inject(DateRangeService);

  readonly blocks = signal<Block[]>([]);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  private add$ = new Subject<Block>();
  private edit$ = new Subject<Block>();
  private remove$ = new Subject<RemoveBlock>();

  private blocks$: Observable<Block[]> = merge(
    this.add$.pipe(
      concatMap((block) => {
        console.log(`Added new block: ${block}`);
        return this.http
          .post("/api/blocks", mapToBlockJson(block))
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.edit$.pipe(
      mergeMap((block) => {
        console.log(`Updated block: ${block}`);
        return this.http
          .put(`/api/blocks/${block.id}`, mapToBlockJson(block))
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.remove$.pipe(
      concatMap((removeBlock) => {
        console.log(`Deleted block: ${removeBlock}`);
        return this.http
          .delete(`/api/blocks/${removeBlock.id}`)
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.dateRangeService.dateRangeExpanded$,
  ).pipe(
    startWith(null),
    tap(() => {
      this.loaded.set(true);
      this.error.set(null);
    }),
    switchMap(() =>
      this.http
        .get<
          BlockJson[]
        >(`/api/blocks?start=${this.dateRangeService.start().toISOString()}`)
        .pipe(catchError((err) => this.handleError(err))),
    ),
    map((json: BlockJson[]) => mapToBlocks(json)),
    map((blocks) => blocks.reverse()),
    takeUntilDestroyed(),
  );

  constructor() {
    this.blocks$.subscribe((blocks) => this.blocks.set(blocks));
  }

  public add() {
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
    return this.blocks$.pipe(take(1));
  }

  public edit(block: Block) {
    this.edit$.next(block);
    return this.blocks$.pipe(take(1));
  }

  public remove(removeBlock: RemoveBlock) {
    this.remove$.next(removeBlock);
    return this.blocks$.pipe(take(1));
  }

  private handleError(err: any) {
    this.error.set(err);
    return EMPTY;
  }
}
