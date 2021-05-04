const File_Pick = "task_2_output.csv";
let barChartDataset = [];
j = 0;
d3.csv(File_Pick).then((data) =>{
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
    buildBarChart(barChartDataset);
});

function buildBarChart(dataset_clean) {
    console.log(dataset_clean)
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    dataset = dataset_clean.map(i => {
        i.Type = i.Type;
        return i;
    });

    var container = d3.select('#d3id'),
        width = 500,
        height = 300,
        margin = {top: 30, right: 20, bottom: 30, left: 50},
        barPadding = .2,
        axisTicks = {qty: 5, outerSize: 0, dateFormat: '%m-%d'};

    var svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding);
    var xScale1 = d3.scaleBand();
    var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);

    xScale0.domain(dataset_clean.map(d => d.Type));
    xScale1.domain(['RetailPrice', 'DealerCost']).range([0, xScale0.bandwidth()]);
    yScale.domain([0, d3.max(dataset_clean, d => d.RetailPrice > d.DealerCost ? d.RetailPrice : d.DealerCost)]);

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
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
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
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });




    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)

        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

}
