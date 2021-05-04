
// let barChart = barChartDataset("task_2_output.csv");





var a;
var p2 = new Promise(function(resolve, reject) {
    resolve();
    reject();
});
p2.then(function(value) {
    var a = barChartDataset("task_2_output.csv")
    b = value["Regular"];

    console.log(b);
});






// buildBarChart(barChart);

// console.log(barChart);

function barChartDataset(url) {
    let retailPrice = [];
    let dealerCost = [];
    let types = [];
    let barChartDataset = new Map();

    d3.csv(url, function(error, data) {
        for(let i = 0 ; i < data.length ; i++){
            retailPrice.push(data[i]["Retail.Price"]);
            dealerCost.push(data[i]["Dealer.Cost"]);
            types.push(data[i]["Type"]);
        }
        for (let j = 0 ; j < types.length ; j++){
            barChartDataset[types[j]] = [retailPrice[j],dealerCost[j]];
        }
    });
    console.log(barChartDataset);
    return barChartDataset;
}





// function buildBarChart(dataset) {
//     var margin = {top: 20, right: 20, bottom: 30, left: 40},
//         width = 960 - margin.left - margin.right,
//         height = 500 - margin.top - margin.bottom;
//
//     var x0 = d3.scale.ordinal()
//         .rangeRoundBands([0, width], .1);
//
//     var x1 = d3.scale.ordinal();
//
//     var y = d3.scale.linear()
//         .range([height, 0]);
//
//     var color = d3.scale.ordinal()
//         .range(["#C4F0FF", "#E8D1FF" , "#FFC4C4", "#F6FFC4"]);
//
//     var xAxis = d3.svg.axis()
//         .scale(x0)
//         .orient("bottom");
//
//     var yAxis = d3.svg.axis()
//         .scale(y)
//         .orient("left")
//         .tickFormat(d3.format(".2s"));
//
//     var svg = d3.select("body").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//
//
//
//
//     console.log(barChart["Regular"]);
// }
