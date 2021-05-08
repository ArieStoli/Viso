const task2CSV = "task_2_output.csv";
const carsCSV = "cars.csv";
const fuelPrices = "Fuel_Prices.csv";
let barChartDataset = [];
j = 0;
d3.csv(task2CSV).then((data) =>{
    // console.log(data);
    data.forEach((d) => {
        d["Dealer.Cost"] = +d["Dealer.Cost"];
        d["Retail.Price"] = +d["Retail.Price"];
        barChartDataset[j] = {"Type":d["Type"],
                              "RetailPrice":d["Retail.Price"],
                              "DealerCost":d["Dealer.Cost"]};
        j = j +1 ;
        return barChartDataset;
    });

    // let barChartDataset = Object.assign(d3.csvParse(await FileAttachment(File_Pick).text(), ({ Type: x, RetailPrice: y, DealerCost: z}) => ({Type: x, RetailPrice: y, DealerCost: z})), {x: "Type", y: "Retail.Price", z: "Dealer.Cost"});

    // console.log(barChartDataset)
    buildBarChart(barChartDataset);
    buildScatterPlot();
    buildLineChart();
});

function buildBarChart(dataset_clean) {
    // console.log(dataset_clean)
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let dataset = dataset_clean.map(i => {
        i.Type = i.Type;
        return i;
    });

    let container = d3.select('#barchart'),
        width = 500,
        height = 300,
        svgPadding = 3;
    var margin = {top: 30, right: 20, bottom: 50, left: 50},
    barPadding = .2,
        axisTicks = {qty: 6, outerSize: 0};

    let svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let xScale0 = d3.scaleBand().range([margin.left, width - margin.left - margin.right]).padding(barPadding);
    let xScale1 = d3.scaleBand();
    let yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    let xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    let yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);

    xScale0.domain(dataset_clean.map(d => d.Type));
    xScale1.domain(['RetailPrice', 'DealerCost']).range([0, xScale0.bandwidth()]);
    yScale.domain([0, d3.max(dataset_clean, d => d.RetailPrice > d.DealerCost ? d.RetailPrice + 8000 : d.DealerCost + 8000)]);

    var Type = svg.selectAll(".Type")
        .data(dataset_clean)
        .enter().append("g")
        .attr("class", "Type")
        .attr("transform", d => `translate(${xScale0(d.Type)},0)`);

    /* Add RetailPrice bars */
    Type.selectAll(".bar.RetailPrice")
        .data(d => [d])
        .enter()
        .append("rect")
        .style("fill","blue")
        .attr("class", "bar RetailPrice")
        .attr("x", d => xScale1('RetailPrice'))
        .attr("y", d => yScale(d.RetailPrice))
        .attr("width", xScale1.bandwidth())
        .attr("height", d => {
            return height - margin.top - margin.bottom - yScale(d.RetailPrice)
        })
        .on("mouseover", function(event,d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Retail Price<br/>" + d.RetailPrice.toFixed(3))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).style('stroke',"black").style("fill","darkblue");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).style('stroke',"none").style("fill","blue");
        });


    /* Add DealerCost bars */
    Type.selectAll(".bar.DealerCost")
        .data(d => [d])
        .enter()
        .append("rect")
        .attr("class", "bar DealerCost")
        .style("fill","red")
        .attr("x", d => xScale1('DealerCost'))
        .attr("y", d => yScale(d.DealerCost))
        .attr("width", xScale1.bandwidth())
        .attr("height", d => {
            return height - margin.top - margin.bottom - yScale(d.DealerCost)
        })
        .on("mouseover", function(event,d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Dealer Cost<br/>" + d.DealerCost.toFixed(3))
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).style('stroke',"black").style("fill","darkred");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).style('stroke',"none").style("fill","red");
        });

    svg.append("text")
        .attr("x", width/3)
        .attr("y", svgPadding)
        .attr("text-anchor", "right")
        .style("font-size", "16px")
        .text("Sales and costs per each vehicle category");


    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(xAxis);

    // X axis label
        svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width / 2.2) + "," + (height - (35)) + ")")
        .text("Vehicle category");

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin.left) + ",0)")

        .call(yAxis);

    // Y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", - height/3)
        .attr("y", 0)
        .attr("transform", "rotate(-90)")
        .text("USD - $");

}

async function buildScatterPlot() {

    var div = d3.select("body").append("div")
        .attr("class", "tooltip2")
        .style("opacity", 0);

    let w = 700;
    let h = 400;
    let padding = 50;

    let dataset = d3.csvParse(await getData(carsCSV), function (d) {
        // if (d.hwyMPG != '*') {
        //
        //     return {
        //         cylinder: d["Cyl"],
        //         hwyMPG: d["Hwy MPG"],
        //         hp: d["HP"],
        //         type: getType(d["Sports Car"], d["SUV"], d["Wagon"], d["Minivan"], d["Pickup"])
        //     };
        // } TODO - wut wut?!

        return {
            cylinder: d["Cyl"],
            hwyMPG: d["Hwy MPG"],
            hp: d["HP"],
            type: getType(d["Sports Car"], d["SUV"], d["Wagon"], d["Minivan"], d["Pickup"])
        };
    });

    let xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => parseInt(d.hp))])
        .range([padding, w - padding * 2]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => parseInt(d.hwyMPG)) + 5])
        .range([h - padding, padding]);

    let rScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => parseInt(d.cylinder))])
        .range([1.5, 5]);

    let container = d3.select('#scatterplot')
                        .attr("width", w)
                        .attr("height", h);

    let svg = container.append("svg")
                .attr("width", w)
                .attr("height", h);

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d.hp);
        })
        .attr("cy", function (d) {
            if (d.hwyMPG != '*')
                return yScale(d.hwyMPG);
            else
                return -200; //TODO - ihsa
        })
        .attr("r", function (d) {
            return rScale(d.cylinder);
        })
        .attr("fill", function (d) { return getColor(d.type); })
        .attr("class", "points")
        .on("mouseover", function(event,d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("HighwayMPG: " + d.hwyMPG + "</br>HorsePower: " + d.hp)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).style("fill","yellow");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).style("fill", function (d) { return getColor(d.type); });
        });

    let axisTicks = {qty: 6, outerSize:0};
    let xAxis = d3.axisBottom(xScale).tickSizeOuter(axisTicks.outerSize);
    let yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${h - padding})`)
        .call(xAxis);

    // X axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (w / 2.2) + "," + (h - 16) + ")")
        .text("Horse power");

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")

        .call(yAxis);

    // Y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", - h/2)
        .attr("y", 16)
        .attr("transform", "rotate(-90)")
        .text("Highway Miles per Gallon");

    // title
    svg.append("text")
        .attr("x", w/3)
        .attr("y", padding)
        .attr("text-anchor", "right")
        .style("font-size", "16px")
        .text("Horse power to miles per gallon fuel consumption ratio");

}

async function buildLineChart() {
    let div = d3.select("body").append("div")
        .attr("class", "tooltip2")
        .style("opacity", 0);

    let margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        svgWidth = 700,
        svgHeight = 400;

    let dates = []
    let dataset = d3.csvParse(await getData(fuelPrices), function (d) {
        // if (d.hwyMPG != '*') {
        //
        //     return {
        //         cylinder: d["Cyl"],
        //         hwyMPG: d["Hwy MPG"],
        //         hp: d["HP"],
        //         type: getType(d["Sports Car"], d["SUV"], d["Wagon"], d["Minivan"], d["Pickup"])
        //     };
        // } TODO - wut wut?!

        dates.push(new Date(d3.timeParse("%m/%d/%Y")(d["Date"])));
        return {
            type: {
                gas: {
                    date: new Date(d3.timeParse("%m/%d/%Y")(d["Date"])),
                    price: parseFloat(d["Petrol (USD)"])
                },
                diesel: {
                    date: new Date(d3.timeParse("%m/%d/%Y")(d["Date"])),
                    price: parseFloat(d["Diesel (USD)"])
                }
            }
        };
    });

    // let xScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, d => parseInt(d.hp))])
    //     .range([padding, w - padding * 2]);
    //
    // let yScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, d => parseInt(d.hwyMPG)) + 5])
    //     .range([h - padding, padding]);

    let container = d3.select('#linechart')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    let svg = container.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    let xScale = d3.scaleTime()
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .range([height, 0]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let axisTicks = {qty: 6, outerSize:0};
    let xAxis = d3.axisBottom(xScale).tickSizeOuter(axisTicks.outerSize);
    let yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);

    color.domain(["Petrol", 'Diesel']);

    xScale.domain(d3.extent(dates, function(d) {
        console.log(d)
        return d;
    }));

    let gasMin = d3.min(dataset, function (d) {
        return d.type.gas.price;
    });

    let dieselMin = d3.min(dataset, function (d) {
        return d.type.diesel.price;
    });

    let gasMax = d3.max(dataset, function (d) {
        return d.type.gas.price;
    });

    let dieselMax = d3.max(dataset, function (d) {
        return d.type.diesel.price;
    });

    yScale.domain([
        dieselMin < gasMin ? gasMin : dieselMin,
        dieselMax < gasMax ? gasMax : dieselMax
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", padding)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");

}


async function getData(url) {
    const response = await fetch(url);
    const str = await response.text();
    return str;
}

function getType(sp, su, wa, mi, pi){   //TODO - ihsa
        if (sp == 1)
            return "Sports car";
        else if (su == 1)
            return "SUV";
        else if (wa == 1)
            return "Wagon";
        else if (mi == 1)
            return "Minivan";
        else if (pi == 1)
            return "Pick-up";
        else
            return "Regular";
}

function getColor(type) {
    switch (type) {
        case 'Sports car':
            return "red"
        case 'SUV':
            return "black";
        default:
            return 'grey'
    }
}
