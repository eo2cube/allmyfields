# All My Fields

This is a web application that lets farmers see the plant vitality anomaly of all their fields in one view. Just drag&drop a GeoJSON file with field boundaries and croptype information and the app will fetch and display the corresponding maps directly from the [AgriSens](https://www.agrisens-demmin.de/) datacube.

Try it now at https://allmyfields.eo2cube.org/

## Usage
The input must be a valid GeoJSON file that contains the fields as (multi-)polygons. Each of these must have the properties `croptype` and `year`, indicating which crop is planted on the field and for which year this information is valid (giving information for multiple years is not supported yet). While `year` is obviously a four-digit number, `croptype` must be one of the strings in the layer names of the [corresponding WMS service](https://ows.eo2cube.org/wms?request=GetCapabilities), e.g. `winter_wheat`, `spring_barley`, `rapeseed` etc.

## Development
To generate a build ready for production:

1. Clone this repo
2. `npm install`
3. `npm run build`
4. Put the contents of the `dist` folder onto a server

If not deploying to the root of a domain, amend the build command to `npm run build -- --base=/path/to/subfolder`.

## Contact
Christoph Friedrich (christoph dot friedrich ät uni minus wuerzburg dot de)
