import { signal, inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs";
import { NavigationTarget } from "../../app.routes";

@Injectable({
  providedIn: "root",
})
export class NavigationTargetService {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  active = signal<NavigationTarget>(NavigationTarget.OUTLINER);

  constructor() {
    this.router.events
      .pipe(
        // Filter succesful routing events
        filter((event) => event instanceof NavigationEnd),
        // map to the currently acivated route
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        // filter the primary route?
        filter((route) => route.outlet === "primary"),
        // get the activeTarget
        map((route) => route.snapshot.data["changeActiveElementTarget"]),
      )
      .subscribe((target) => this.active.set(target));
  }
}
