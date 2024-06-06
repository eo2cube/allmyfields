import './style.css';
import 'ol-ext/dist/ol-ext.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import Crop from 'ol-ext/filter/Crop';
import { fromLonLat } from 'ol/proj';

const osm = new TileLayer({
  source: new OSM()
});

const wms = new TileLayer({
  source: new TileWMS({
    url: 'https://ows.eo2cube.org/wms',
    params: {
      'LAYERS': 's2_vi_evi_diff_winter_wheat',
      'TIME': '2021-06-17T00:00:00Z' // 2022-06-17 (rapeseed), 2023-06-22 (unknown)
    }
  })
});

const map = new Map({
  target: 'map',
  layers: [
    osm,
    wms,
  ],
  view: new View({
    center: fromLonLat([13.23441, 53.82732]),
    zoom: 15
  })
});

window.dragoverHandler = function (event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}
window.dropHandler = function (event) {
  event.preventDefault();
  event.dataTransfer.files[0].text().then(handleGeoJson);
}

function handleGeoJson(fileContent) {
  const geojson = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(fileContent),
    }),
  });
  const crop = new Crop({
    feature: geojson.getSource().getFeatures()[0],
  });
  map.addLayer(geojson);
  wms.addFilter(crop);
}
