import { Injectable, computed, inject, signal } from "@angular/core";
import { Project } from "../../model/project.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  catchError,
  concatMap,
  EMPTY,
  map,
  merge,
  Observable,
  skip,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from "rxjs";
import { ProjectJson } from "../../model/project.interface";
import { mapToProjectJson, mapToProjects } from "../../model/project.mapper";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ColorService } from "../../shared/data/color.service";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private AS_JSON_HEADERS = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  private http = inject(HttpClient);
  private colorService = inject(ColorService);

  readonly projects = signal<Project[]>([]);
  readonly unarchivedProjects = computed(() =>
    this.projects().filter((project) => project.archived === false),
  );
  readonly loaded = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private add$ = new Subject<Project>();
  private edit$ = new Subject<Project>();

  private projects$: Observable<Project[]> = merge(
    this.add$.pipe(
      concatMap((project) => {
        console.log(`Adding project: ${project}`);
        return this.http
          .post<ProjectJson>(
            `/api/projects`,
            mapToProjectJson(project),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
    this.edit$.pipe(
      concatMap((project) => {
        console.log(`Editing project: ${project}`);
        return this.http
          .put<ProjectJson>(
            `/api/projects/${project.id}`,
            mapToProjectJson(project),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    ),
  ).pipe(
    startWith(null),
    tap(() => {
      this.loaded.set(true);
      this.error.set(null);
    }),
    switchMap(() =>
      this.http
        .get<ProjectJson[]>(`/api/projects`)
        .pipe(catchError((err) => this.handleError(err))),
    ),
    map((json: ProjectJson[]) => mapToProjects(json)),
    takeUntilDestroyed(),
  );

  constructor() {
    this.projects$.subscribe((projects) => this.projects.set(projects));
  }

  public add(projectName: string) {
    this.add$.next({
      id: 0,
      name: projectName,
      color: this.colorService.defaultColor,
      archived: false,
    });
    return this.projects$.pipe(take(1));
  }

  public edit(project: Project) {
    this.edit$.next(project);
    return this.projects$.pipe(take(1));
  }

  public archive(projectId: number) {
    let current = this.projects().find((project) => project.id === projectId);
    if (!current) {
      // Not sure what kind of error handling I want here
      // if at all, if an ID is provided that does not exist in the current set of projects,
      // there is not much to be done?
      // Maybe show an error to the end user?
      return;
    }
    current.archived = true;
    this.edit$.next(current);
    return this.projects$.pipe(skip(1), take(1));
  }

  public unarchive(projectId: number) {
    let current = this.projects().find((project) => project.id === projectId);
    if (!current) {
      // Not sure what kind of error handling I want here
      // if at all, if an ID is provided that does not exist in the current set of projects,
      // there is not much to be done?
      // Maybe show an error to the end user?
      return;
    }
    current.archived = false;
    this.edit$.next(current);
    return this.projects$.pipe(skip(1), take(1));
  }

  public resolveFromName(projectName: string): Project | undefined {
    return this.projects().find((project) => project.name === projectName);
  }

  private handleError(err: any) {
    this.error.set(err);
    return EMPTY;
  }
}
