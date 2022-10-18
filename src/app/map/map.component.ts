import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';

import { loadModules } from 'esri-loader/dist/esm/modules';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  public view: any = null;

  // The <div> where we will place the map
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;

  initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;

    const webmap = new WebMap({    //A webmap is a styled basemap and can be easily used by referencing the portal ID
      portalItem: {
        id: 'aa1d3f80270146208328cf66d022e09c',
      },
    });

    const view = new MapView({
      container,
      center: [103.856, 1.389], //[Longitude, Latitude] optional component
      map: webmap
    });

    this.view = view;
    return this.view.when();
  }

  //******************************************************************************* */
  //Routing Services
  getRoute() {
    loadModules(['esri/rest/route', 'esri/rest/support/RouteParameters', 'esri/core/Collection', 'esri/rest/support/Stop'])
      .then(([route, RouteParameters, Collection, Stop]) => {

        const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"; 

        const stops = new Collection([
          new Stop({
            geometry: { x: 103.87395, y: 1.37372 },
            name: "Start Point"
          }),
          new Stop({
            geometry: { x: 103.74436, y: 1.39788 },
            name: "End Point"
          })
        ])

        const routeParams = new RouteParameters({
          apiKey: "AAPK1a21c07298794808a7911cd43546f98b0p6OJRYRVGykG-FbYI4VDHaOJTmbCTjJiJPHlc4QwBbVuTGo1Qd2T50WBspeUASV",
          stops,
          returnDirections: true, //Currently not being used: for directions
          directionsLanguage: "es" //Currently not being used: for directions
        });

        route.solve(routeUrl, routeParams)
          .then((data: any) => {
            if (data.routeResults.length > 0) {
              this.showRoute(data.routeResults[0].route);
            }
          })
          .catch((error: any) => {
            console.log(error);
          })
      })
  }

  showRoute(routeResult: any) {
    routeResult.symbol = {
      type: "simple-line",
      color: [5, 150, 255],
      width: 3
    };
    this.view.graphics.add(routeResult, 0);
  }
  /******************************************************************************** */

  ngOnInit(): any {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(() => {
      // The map has been initialized
      console.log('The map is ready.');
    });
  }

  ngOnDestroy(): void {
    if (this.view) {
      // destroy the map view
      this.view.destroy();
    }
  }
}

