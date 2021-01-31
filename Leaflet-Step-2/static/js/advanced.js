var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plate_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
                 

getRadius=(mag)=>{
    if(mag === 0){
        return 30000;
    } else{
        return mag * 30000
    }
}

getColor=(depth)=>{
    switch(true){
        case depth >= -10 && depth < 10:
            return "#a3f600";
        case depth >= 10 && depth < 30:
            return "#dcf400";
        case depth >= 30 && depth < 50:
            return "#f7db11";
        case depth >= 50 && depth < 70:
            return "#fdb72a";
        case depth >= 70 && depth < 90:
            return "#fca35d";
        case depth >= 90:
            return "#ff5f65";

    }
}

createFeatures=(earthquakeData, platesData)=>{

    onEachFeature=(feature, layer)=>{
        layer.bindPopup("<h1>Place:" + feature.properties.place + "</h1> <hr> <h3>Magnitude: " + 
         feature.properties.mag + "</h3> <hr> <h3>Depth: " + feature.geometry.coordinates[2] + "</h3>");
    }

    var earthquakes = L.geoJSON(earthquakeData,{
        pointToLayer:(feature, latlang) => {
            return new L.circle(latlang,{
                fillOpacity: 0.75,
                color: getColor(feature.geometry.coordinates[2]),
                weight: 1,
                fillColor: getColor(feature.geometry.coordinates[2]),
                // Adjust radius
                radius: getRadius(feature.properties.mag)
            });
        },
        onEachFeature: onEachFeature
    });

    
    var plates = L.geoJSON(platesData,{color: "red"});

    createMap(earthquakes, plates);
}

createMap=(earthquakes, plates)=>{

    // Define tileLayers
    const satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-streets-v11',
        accessToken: API_KEY
    });

    const grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    const outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        Satellite: satellite,
        Grayscale: grayscale,
        Outdoors: outdoors
    };
    
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        TectonicsPlates: plates
    };

    var myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [satellite, earthquakes]
    });
    
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Keep the earthquakes layer on top at all times when it is on
    myMap.on("overlayadd", function (event) {
        earthquakes.bringToFront();
    });

    // Add in our legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function (myMap) {
        let div = L.DomUtil.create('div', 'info legend');
        var labels = ['&nbsp&nbsp<strong>Earthquake Depth (km)</strong>'];
            
        depth_categories = ['-10-10','10-30','30-50','50-70','70-90','90+'];
        depth_categories_color = [9, 11, 31, 51, 71, 100];
    
        for (let i = 0; i < depth_categories.length; i++) {
            div.innerHTML += 
            labels.push(`<i style="background:${getColor(depth_categories_color[i])}"></i>${depth_categories[i]}`);
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
}

// var earthquake_data;
// var plates_data;

// init=()=>{
//     // var earthquake_data;
//     // var plates_data;
//     d3.json(url, function(data){
//         earthquake_data = data.features;
//     });
    
//     d3.json(plate_url, function(platedata){
//         //console.log(platedata.features);
//         plates_data = platedata.features;
//         //console.log(plates_data);
//     });
//     console.log(plates_data);
// }

// init()


d3.json(url, function(data){
    var earthquake_data = data.features;
    d3.json(plate_url, function(platedata){
        var plates_data = platedata.features;
        createFeatures(earthquake_data, plates_data);
    });
});
