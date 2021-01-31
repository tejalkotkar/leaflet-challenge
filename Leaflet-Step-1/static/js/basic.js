var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

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

createFeatures=(earthquakeData)=>{

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

    createMap(earthquakes);
}

createMap=(earthquakes)=>{

    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [light, earthquakes]
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


d3.json(url, function(data){
    createFeatures(data.features);
});