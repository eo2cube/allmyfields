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
import Feature from 'ol/Feature';
import { MultiPolygon } from 'ol/geom';
import WMSCapabilities from 'ol/format/WMSCapabilities';

let allWMSlayers = [];

const dateslider = document.getElementById('dateslider');
const datepicker = document.getElementById('datepicker');

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
  
  const geojson = new VectorLayer({
    source: new VectorSource({
      features: features,
    }),
  });
  map.addLayer(geojson);

  // we need one WMS layer per crop type
  const uniqueCroptypes = features.map(e => e.getProperties().croptype).filter((e,i,a) => a.indexOf(e) == i);
  for(const ct of uniqueCroptypes) {
    // get all fields that have that croptype and merge them into one big MultiPolygon (because Crop only accepts one Feature)
    const matchingFeatures = features.filter(e => e.getProperties().croptype == ct);
    const coords = matchingFeatures.map(e => e.getGeometry().getCoordinates());
    const asOneFeature = new Feature(new MultiPolygon([].concat(...coords)));
    // simply take the properties of the first feature (croptype definitely is and year should be the same anyway)
    const properties = matchingFeatures[0].getProperties();
    datepicker.value = properties.year + '-06-17';
    // create WMS and its mask and add it all to the map
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
      feature: asOneFeature,
    });
    wms.addFilter(crop);
    map.addLayer(wms);
    allWMSlayers.push(wms);
  }

  map.getView().fit(geojson.getSource().getExtent(), {padding:[50,50,50,50]});
}

window.changeSliderHandler = function (event) {
  let date = new Date();
  date.setUTCFullYear(datepicker.value.substr(0, 4));
  date.setUTCMonth(0); // + '-01-01');  // init with 1st January of the same year
  date.setUTCDate(dateslider.value);  // set DOY (between 1 and 365)
  datepicker.value = date.toISOString().substr(0, 10);
  window.changeDateHandler();
  /*
  let date = new Date(datepicker.value.substr(0,4)+'-01-01');  // init with 1st of January of the same year
  date.setDate(dateslider.value);  // set DOY (between 1 and 365, ignoring leap years)
  let m = date.getMonth() + 1;  // month is zero-indexed
  let mm = (m<10 ? '0' : '') + m;
  let d = date.getDate();
  let dd = (d<10 ? '0' : '') + d;
  datepicker.value = year + '-' + mm + '-' + dd;
  */
}

window.changeDateHandler = function (event) {
  setWMSDate(datepicker.value);
}

function setWMSDate(date) {
  allWMSlayers.forEach(e => e.getSource().updateParams({'TIME': date + 'T00:00:00Z'}));
}
