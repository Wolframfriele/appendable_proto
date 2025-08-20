import { Routes } from "@angular/router";
import { ProjectsComponent } from "./projects/projects.component";
import OutlinerComponent from "./outliner/outliner.component";

export enum NavigationTarget {
  OUTLINER,
  PROJECTS,
}

export const routes: Routes = [
  {
    path: "",
    component: OutlinerComponent,
    title: "Outliner",
    data: { changeActiveElementTarget: NavigationTarget.OUTLINER },
  },
  {
    path: "projects",
    component: ProjectsComponent,
    title: "Projects",
    data: { changeActiveElementTarget: NavigationTarget.PROJECTS },
  },
];
