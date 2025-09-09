import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  Routes,
} from "@angular/router";
import { ProjectsComponent } from "./projects/projects.component";
import OutlinerComponent from "./outliner/outliner.component";
import { LoginComponent } from "./auth/login/login.component";
import { inject } from "@angular/core";
import { AuthService } from "./auth/data/auth.service";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    authService.redirectUrl = state.url;
    const loginPath = router.parseUrl("/login");
    return new RedirectCommand(loginPath, {
      skipLocationChange: true,
    });
  }

  return true;
};

export const routes: Routes = [
  {
    path: "",
    component: OutlinerComponent,
    title: "Outliner",
    canActivate: [authGuard],
  },
  {
    path: "projects",
    component: ProjectsComponent,
    title: "Projects",
    canActivate: [authGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    title: "Login",
  },
  { path: "**", component: PageNotFoundComponent, title: "Page not found" },
];
