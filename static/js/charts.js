//Keep the fetched data 
var data = null;
var selector = d3.select("#selDataset");

//Program is started from Init 
function init() {

  //Make a request to samples.json
  d3.json("static/data/samples.json").then((dataJson) => {
    //console.log(dt);

    //assign data json object to data
    data = dataJson;
    //load dropdown selector
    initDataset(data);

    //init dashboard
    loadDashboard(selector.node().value);
  });
}
/*################################################################*/

//load the dataset dropdown and binding event
function initDataset(data)
{
  //get data
  let sampleNames = data.names;
  //load data
  sampleNames.forEach((sample) => {
    selector
      .append("option")
      .text(sample)
      .property("value", sample);
  });
  //binding event
  selector.on("change", selectorHandler );
}
//handle selector
function selectorHandler()
{
  newSample=this.value;
  loadDashboard(newSample);
}
//load a new data into Dashboard
function loadDashboard(newSample)
{
  buildMetadata(newSample);
  buildCharts(newSample);
}
/*################################################################*/
//load a new details DIV= #sample-metadata
function buildMetadata(sample) {

    var metadata = data.metadata;
    //more efficient way use find
    var result = metadata.find(sampleObj => sampleObj.id == sample);

    var PANEL = d3.select("#sample-metadata");
    PANEL.html("");
    Object.entries(result).forEach(([key,value]) =>
          PANEL.append("h6").text(`${key}:${value}`)
    );
}
//load Charts
function buildCharts(sample){
   top10BacterialSpecies(sample);
   bubbleBacterialSpecies(sample);
   gaugeFrequencyWash(sample);
}
/*################################################################*/
//load a bar Chart DIV = #bar
function top10BacterialSpecies(sample){
   //get data
   let sampledata = data.samples;
   //find first match sample id
   let result = sampledata.find(sampleObj => sampleObj.id == sample);
   
   //sample_values have been sorted, do not to sort
   //assign arrays
   let sample_values = result.sample_values.slice(0,10).reverse();
   let otu_ids = result.otu_ids.slice(0,10).map( value=> `OTU ${value}`).reverse();
   let otu_labels = result.otu_labels.slice(0,10).map(value=> value.replace(/;/gi,"<br>")).reverse();
   //create trace data with above array
   let traceData = [
     {
       y: otu_ids,
       x : sample_values,
       text: otu_labels,
       type: 'bar',
       orientation: 'h'
     }
   ]
   //setup layout
   let layout={
    hoverlabel: { bgcolor: "#1FBED6" }
   }
   //plot
   Plotly.newPlot("bar",traceData,layout)
}
//load a bubble chart DIV = #bubble
function bubbleBacterialSpecies(sample){
  //get data
  let sampledata = data.samples;
  //find first match sample id
  let result = sampledata.find(sampleObj => sampleObj.id == sample);
  //assign arrays
  let sample_values = result.sample_values;
  let otu_ids = result.otu_ids;
  let otu_labels = result.otu_labels.map(value=> value.replace(/;/gi,"<br>"));
  //create trace data with above array
  let traceData = [
    {
      x: otu_ids,
      y : sample_values,
      text: otu_labels,
      mode: 'markers',
      marker:{
          size: sample_values,
          color: otu_ids,
          colorscale : "Earth"
      }
    }
  ];
  //setup layout
  let layout={
   hoverlabel: { bgcolor: "#1FBED6" }
  }
  //plot 
  Plotly.newPlot("bubble",traceData,layout)
}
//load a bar Gauge DIV = #gauge
function gaugeFrequencyWash(sample)
{
  //get data
  let metadata = data.metadata;
  //find first match sample id
  let result = metadata.find(sampleObj => sampleObj.id == sample);
  //create trace data with above array
  let traceData = [
    {
      type: "indicator",
      mode: "gauge+number",
      title: { "text": "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      value: result.wfreq,
      delta:{ reference: 0 },
      gauge: {
          bgcolor: "white",
          borderwidth: 2,
          bordercolor: "gray",
          axis: { range: [null, 9],
            ticks:"inside",
            tickwidth:0,
            ticklen:0,
            tickmode:"array",
            tickvals:[0,1,2,3,4,5,6,7,8,9],
            showticklabels:true
           },
          bar: { color: "red", thickness: 0.2 },
          borderwidth: 0,
          steps: [
            { range: [0, 1], color: "#FCFCEC" },
            { range: [1, 2], color: "#F0F0E0" },
            { range: [2, 3], color: "#E9E6CA" },
            { range: [3, 4], color: "#E5E7B3" },
            { range: [4, 5], color: "#D5E49D" },
            { range: [5, 6], color: "#B7CC92" },
            { range: [6, 7], color: "#8CBF88" },
            { range: [7, 8], color: "#8ABB8F" },
            { range: [8 ,9], color: "#85B48A" }
          ]
          }
  }
  ]
  //plot
  Plotly.newPlot("gauge",traceData);
}
/*################################################################*/
//Run the javascript
init();



    /*###### Gauge with needle ######
    //CSS
    .chart {
        max-height: calc(250px + 25px) !important;
        overflow:hidden;
    }
    //JS
    // Enter a speed between 0 and 180
    var level = washFreq;

    // Trig to calc meter point
    var degrees = 180 - ((level/9)*180),
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
    // Path: may have to change to create a better triangle
    var mainPath = path1,
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var dataGauge2 = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 14, color:'850000'},
        showlegend: false,
        name: 'wash frequency',
        text: level,
        hoverinfo: 'text+name'},
      { values: [1,1,1,1,1,1,1,1,1,9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6','4-5','3-4','2-3','1-2','0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
        colors:[
          'rgba(28, 106, 11, 1)',
          'rgba(51, 122, 33, 1)',
          'rgba(75, 138, 56, 1)',
          'rgba(99, 155, 78, 1)',
          'rgba(123, 171, 101, 1)',
          'rgba(146, 187, 124, 1)',
          'rgba(170, 204, 146, 1)',
          'rgba(194, 220, 169, 1)',
          'rgba(218, 237, 192, 1)',
          'rgba(0, 0, 0, 0)']
      },
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layoutGauge2 = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      height: 500,
      width: 500,
      title: { text: "Belly Button Washing Frequency <br> Scrubs per Week" },
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', dataGauge2, layoutGauge2);

    */
