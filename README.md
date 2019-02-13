# Worldwide Earthquake Activity Monitor

## Preview

This web application collects worldwide seismic activity data for the last 7-days and provides timely visulization about the earthquake data 
[View Website](https://earthquake-last-week.herokuapp.com/) 

## Method and Usage

### Step 1: Import & visualize earthquake data
   * Data set is collected from The United States Geological Survey Website [USGS GeoJSON Feed](http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) as 'All Earthquakes from the Past 7 Days'
   ![4-JSON](Images/4-JSON.png)

   * A map is created using Leaflet to plot all of the earthquakes based on their longitude and latitude
![2-BasicMap](Images/2-BasicMap.png)

   * Data markers reflects the magnitude of the earthquake in their size and color
   
   * Popups provides additional information about the earthquake when a marker is clicked

### Step 2: Create multiple layer control
   * Data for [tectonic plates](https://github.com/fraxen/tectonicplates) is added to the original map to show the relationship between tectonic plates and seismic activity
   
   * Added layer controls to select a number of base maps that can be turned on and off independently

![5-Advanced](Images/5-Advanced.png)

### Step 3: Real-time Earthquake Map

   * Leaflet.timeline.js plugin is utilized to display the timeline of seismic activity over the past 7 days



