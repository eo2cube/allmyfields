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

const map = new Map({
  target: 'map',
  layers: [
    osm,
  ],
  view: new View({
    center: fromLonLat([13.23441, 53.82732]),
    zoom: 7
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
  const features = new GeoJSON().readFeatures(fileContent);
  const properties = features[0].getProperties();
  
  const geojson = new VectorLayer({
    source: new VectorSource({
      features: features,
    }),
  });
  
  const wms = new TileLayer({
    source: new TileWMS({
      url: 'https://ows.eo2cube.org/wms',
      params: {
        'LAYERS': 's2_vi_evi_diff_' + properties.croptype,
        'TIME': properties.year + '-06-17T00:00:00Z',
      }
    })
  });

  const crop = new Crop({
    feature: features[0],
  });

  wms.addFilter(crop);
  map.addLayer(wms);
  map.addLayer(geojson);

  map.getView().fit(geojson.getSource().getExtent(), {padding:[50,50,50,50]});
}
