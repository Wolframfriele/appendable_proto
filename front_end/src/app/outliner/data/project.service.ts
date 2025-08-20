import { Injectable, computed, inject, signal } from "@angular/core";
import { Project } from "../../model/project.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CommandService } from "../../shared/data/command.service";
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
import { ProjectJson } from "../../model/project.interface";
import {
  mapToProject,
  mapToProjectJson,
  mapToProjects,
} from "../../model/project.mapper";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface ProjectState {
  projects: Project[];
  loaded: boolean;
  error: String | null;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private AS_JSON_HEADERS = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  private http = inject(HttpClient);

  private state = signal<ProjectState>({
    projects: [],
    loaded: false,
    error: null,
  });

  projects = computed(() => this.state().projects);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  add$ = new Subject<Project>();
  edit$ = new Subject<Project>();
  remove$ = new Subject<Project>();

  constructor() {
    const projectAdded$ = this.add$.pipe(
      concatMap((project) => {
        console.log(`Adding project: ${project}`);
        return this.http
          .post<ProjectJson>(
            `/api/projects/${project.id}`,
            mapToProjectJson(project),
            this.AS_JSON_HEADERS,
          )
          .pipe(catchError((err) => this.handleError(err)));
      }),
    );

    merge(projectAdded$)
      .pipe(
        startWith(null),
        switchMap(() =>
          this.http
            .get<ProjectJson[]>(`/api/projects`)
            .pipe(catchError((err) => this.handleError(err))),
        ),
        map((json: ProjectJson[]) => mapToProjects(json)),
        takeUntilDestroyed(),
      )
      .subscribe((projects) => {
        this.state.update((state) => ({
          ...state,
          projects: projects.reverse(),
          loaded: true,
        }));
      });
  }

  private handleError(err: any) {
    this.state.update((state) => ({ ...state, error: err }));
    return EMPTY;
  }

  public resolveFromName(projectName: string): Project | undefined {
    return this.projects().find((project) => project.name === projectName);
  }
}
