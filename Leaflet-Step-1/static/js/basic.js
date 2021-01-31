// Store API endpoint as url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

/*
getRadius =>
Function to adjust the radius of the circle.
Takes the magnitude as the parameter and return the radius.
*/
getRadius=(mag)=>{
    // If magnitude of the earthquake is 0, then return the radius as 30000
    if(mag === 0){
        return 30000;
    } 
    // If magnitude of the earthquake is not 0, then return the radius as 30000 times of magnitude
    else{
        return mag * 30000
    }
}

/*
getColor =>
Function to get the color of the circle.
Takes the depth as the parameter and return the color depending on value of depth.
*/
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

createFeatures=(earthquakeData)=>{

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place, magnitude and depth of the earthquake
    onEachFeature=(feature, layer)=>{
        layer.bindPopup("<h1>Place:" + feature.properties.place + "</h1> <hr> <h3>Magnitude: " + 
         feature.properties.mag + "</h3> <hr> <h3>Depth: " + feature.geometry.coordinates[2] + "</h3>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    // PointToLayer to create a circles
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

    // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
}


createMap=(earthquakes)=>{

    // Define lightmap layer
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    // Create map, giving it the light and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [light, earthquakes]
    });
    
    // Add in our legend
    // define the position of the legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {
        // Create HTML div element
        let div = L.DomUtil.create('div', 'info legend');

        // Create labels array with the heading of the lagend as the first value
        var labels = ['&nbsp&nbsp<strong>Earthquake Depth (km)</strong>'];
        
        // Defining the depth_categories and the depth_categories_color to get the legend text & color
        depth_categories = ['-10-10','10-30','30-50','50-70','70-90','90+'];
        depth_categories_color = [9, 11, 31, 51, 71, 100];
    
        // Loop through the depth_categories and get the color & text
        for (let i = 0; i < depth_categories.length; i++) {
            div.innerHTML += 
            // Add the legend labels to the labels
            labels.push(`<i style="background:${getColor(depth_categories_color[i])}"></i>${depth_categories[i]}`);
        }
        div.innerHTML = labels.join('<br>');

        // Return div element
        return div;
    };
    // Add legend to map
    legend.addTo(myMap);
}

// Perform a GET request to the query URL
d3.json(url, function(data){
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});