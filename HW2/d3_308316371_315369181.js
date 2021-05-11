const task2CSV = 'task_2_output.csv';
const carsCSV = 'cars.csv';
const fuelPrices = 'Fuel_Prices.csv';

const svgSize = {
    width : 700,
    height : 400,
    margin: {
        left : 50,
        right : 50,
        top : 20,
        bottom : 30
    },
    padding : 3,
    barPadding : 0.2,
}

const axisTicks = {
    qty: 6,
    outerSize: 0
}

buildBarChart();
buildScatterPlot();
buildLineChart();

async function buildBarChart() {

    let dataset = d3.csvParse(await getData(task2CSV), function (d) {
        let temp = {
                Type: d['Type'],
                RetailPrice: d['Retail.Price'],
                DealerCost: d['Dealer.Cost'],
        };
        return temp;

    });

	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);

	let dataset_clean = dataset.map((i) => {
		i.Type = i.Type;
		return i;
	});

	let container = d3.select('#barchart')

	let svg = container
		.append('svg')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

	let xScale0 = d3
		.scaleBand()
		.range([svgSize.margin.left, svgSize.width - svgSize.margin.left - svgSize.margin.right])
		.padding(svgSize.barPadding);
	let xScale1 = d3.scaleBand();
	let yScale = d3.scaleLinear().range([svgSize.height - svgSize.margin.top - svgSize.margin.bottom, 0]);

	xScale0.domain(dataset_clean.map((d) => d.Type));
	xScale1.domain(['RetailPrice', 'DealerCost']).range([0, xScale0.bandwidth()]);
	yScale.domain([
		0,
		d3.max(dataset_clean, (d) =>
			d.RetailPrice > d.DealerCost ? d.RetailPrice + 8000 : d.DealerCost + 8000
		),
	]);

    let xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    let yAxis = d3
        .axisLeft(yScale)
        .ticks(axisTicks.qty)
        .tickSizeOuter(axisTicks.outerSize);

	let Type = svg
		.selectAll('.Type')
		.data(dataset_clean)
		.enter()
		.append('g')
		.attr('class', 'Type')
		.attr('transform', (d) => `translate(${xScale0(d.Type)},0)`);

	/* Add RetailPrice bars */
	Type.selectAll('.bar.RetailPrice')
		.data((d) => [d])
		.enter()
		.append('rect')
		.style('fill', 'blue')
		.attr('class', 'bar RetailPrice')
		.attr('x', (d) => xScale1('RetailPrice'))
		.attr('y', (d) => yScale(d.RetailPrice))
		.attr('width', xScale1.bandwidth())
		.attr('height', (d) => {
			return svgSize.height - svgSize.margin.bottom - svgSize.margin.top - yScale(d.RetailPrice);
		})
		.on('mouseover', function (event, d) {
			div.transition().duration(200).style('opacity', 0.9);
			div
				.html('Retail Price<br/>' + parseFloat(d.RetailPrice).toFixed(3))
				.style('left', event.pageX + 'px')
				.style('top', event.pageY - 15 + 'px');
			d3.select(this).style('stroke', 'black').style('fill', 'darkblue');
		})
		.on('mouseout', function (d) {
			div.transition().duration(500).style('opacity', 0);
			d3.select(this).style('stroke', 'none').style('fill', 'blue');
		});

	/* Add DealerCost bars */
	Type.selectAll('.bar.DealerCost')
		.data((d) => [d])
		.enter()
		.append('rect')
		.attr('class', 'bar DealerCost')
		.style('fill', 'red')
		.attr('x', (d) => xScale1('DealerCost'))
		.attr('y', (d) => yScale(d.DealerCost))
		.attr('width', xScale1.bandwidth())
		.attr('height', (d) => {
			return svgSize.height - svgSize.margin.bottom - svgSize.margin.top - yScale(d.DealerCost);
		})
		.on('mouseover', function (event, d) {
			div.transition().duration(200).style('opacity', 0.9);
			div
				.html('Dealer Cost<br/>' + parseFloat(d.DealerCost).toFixed(3))
				.style('left', event.pageX + 'px')
				.style('top', event.pageY - 15 + 'px');
			d3.select(this).style('stroke', 'black').style('fill', 'darkred');
		})
		.on('mouseout', function (d) {
			div.transition().duration(500).style('opacity', 0);
			d3.select(this).style('stroke', 'none').style('fill', 'red');
		});

	svg
		.append('text')
		.attr('x', svgSize.width / 3)
		.attr('y', svgSize.margin.top)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text('Sales and costs per each vehicle category')
        .attr("class", "chartTitle");

	// Add the X Axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0,${svgSize.height - svgSize.margin.bottom - svgSize.margin.top})`)
		.call(xAxis);

	// X axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(' + svgSize.width / 2.2 + ',' + (svgSize.height - 10) + ')')
		.text('Vehicle category')
        .attr("class", "axisLabel");

	// Add the Y Axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + (svgSize.margin.left + 5) + ',0)')
        .call(yAxis);

	// Y axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', -svgSize.height / 3)
		.attr('y', 10)
		.attr('transform', 'rotate(-90)')
		.text('USD - $')
        .attr("class", "axisLabel");
}

async function buildScatterPlot() {
	var div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip2')
		.style('opacity', 0);

	let padding = 50;

	let dataset = d3.csvParse(await getData(carsCSV), function (d) {

		return {
			cylinder: d['Cyl'],
			hwyMPG: d['Hwy MPG'],
			hp: d['HP'],
			type: getType(
				d['Sports Car'],
				d['SUV'],
				d['Wagon'],
				d['Minivan'],
				d['Pickup']
			),
		};
	});

	let xScale = d3
		.scaleLinear()
		.domain([0, d3.max(dataset, (d) => parseInt(d.hp))+25])
		.range([padding, svgSize.width - padding * 2]);

	let yScale = d3
		.scaleLinear()
		.domain([0, d3.max(dataset, (d) => parseInt(d.hwyMPG)) + 5])
		.range([svgSize.height - padding, padding]);

	let rScale = d3
		.scaleLinear()
		.domain([0, d3.max(dataset, (d) => parseInt(d.cylinder))])
		.range([1.5, 5]);

	let container = d3.select('#scatterplot').attr('width', svgSize.width).attr('height', svgSize.height);

	let svg = container.append('svg').attr('width', svgSize.width).attr('height', svgSize.height);

	svg
		.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cx', function (d) {
			return xScale(d.hp);
		})
        .attr('cy', function (d) {
            return yScale(d.hwyMPG);
        })
        .attr('r', function (d) {
			return rScale(d.cylinder);
		})
		.attr('fill', function (d) {
			return getColor(d.type);
		})
		.attr('class', 'points')
		.on('mouseover', function (event, d) {
			div.transition().duration(200).style('opacity', 0.9);
			div
				.html('HighwayMPG: ' + d.hwyMPG + '</br>HorsePower: ' + d.hp)
				.style('left', event.pageX + 'px')
				.style('top', event.pageY - 28 + 'px');
			d3.select(this).style('fill', 'yellow');
		})
		.on('mouseout', function (d) {
			div.transition().duration(500).style('opacity', 0);
			d3.select(this).style('fill', function (d) {
				return getColor(d.type);
			});
		});

	let xAxis = d3.axisBottom(xScale).tickSizeOuter(axisTicks.outerSize);
	let yAxis = d3
		.axisLeft(yScale)
		.ticks(axisTicks.qty)
		.tickSizeOuter(axisTicks.outerSize);

	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0,${svgSize.height - padding})`)
		.call(xAxis);

	// X axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(' + svgSize.width / 2.2 + ',' + (svgSize.height - 16) + ')')
		.text('Horse power')
        .attr("class", "axisLabel");

	// Add the Y Axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + padding + ',0)')

		.call(yAxis);

	// Y axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', -svgSize.height / 2)
		.attr('y', 16)
		.attr('transform', 'rotate(-90)')
		.text('Highway Miles per Gallon')
        .attr("class", "axisLabel");

	// title
	svg
		.append('text')
		.attr('x', svgSize.width / 3)
		.attr('y', padding)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text('Horse power to miles per gallon fuel consumption ratio')
        .attr("class", "chartTitle");
}

async function buildLineChart() {

	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip2')
		.style('opacity', 0);

	let dates = [];
	let dataset = d3.csvParse(await getData(fuelPrices), function (d) {

		dates.push(new Date(d3.timeParse('%m/%d/%Y')(d['Date'])));
		return {
			date: d3.timeParse('%m/%d/%Y')(d['Date']),
			priceGas: parseFloat(d['Petrol (USD)']),
			priceDiesel: parseFloat(d['Diesel (USD)']),
		};
	});

    let gasMin = d3.min(dataset, function (d) {
        return d.priceGas;
    });

    let dieselMin = d3.min(dataset, function (d) {
        return d.priceDiesel;
    });

    let gasMax = d3.max(dataset, function (d) {
        return d.priceGas;
    });

    let dieselMax = d3.max(dataset, function (d) {
        return d.priceDiesel;
    });

	let container = d3
		.select('#linechart')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

	let svg = container
		.append('svg')
		.attr('width', svgSize.width + 50)
		.attr('height', svgSize.height);

	let xScale = d3.scaleTime().range([0, svgSize.width]);

	let yScale = d3.scaleLinear().range([svgSize.height - svgSize.margin.bottom - svgSize.margin.top, 0]);

	let color = d3.scaleOrdinal(d3.schemeCategory10);

    xScale.domain(
        d3.extent(dates, function (d) {
            return d;
        })
    );

    yScale.domain([
        // dieselMin < gasMin ? gasMin - 5 : dieselMin - 5,
        0,
        dieselMax < gasMax ? gasMax + 15 : dieselMax + 15,
    ]);

	let xAxis = d3.axisBottom(xScale).tickSizeOuter(axisTicks.outerSize);
	let yAxis = d3
		.axisLeft(yScale)
		.ticks(axisTicks.qty)
		.tickSizeOuter(axisTicks.outerSize);

	color.domain(['Petrol', 'Diesel']);


	var valueline = d3
		.line()
		.x(function (d) {
			return xScale(d.date);
		})
		.y(function (d) {
			return yScale(d.priceGas);
		});


	var valueline2 = d3
		.line()
		.x(function (d) {
			return xScale(d.date);
		})
		.y(function (d) {
			return yScale(d.priceDiesel);
		});

	//Add the X Axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(${svgSize.margin.left},${svgSize.height - svgSize.margin.bottom - svgSize.margin.top})`)
		.call(xAxis);

	// X axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'translate(' + (svgSize.width - svgSize.margin.left) / 1.7 + ',' + (svgSize.height - svgSize.margin.bottom + svgSize.margin.top) + ')')
		.text('Years')
        .attr("class", "axisLabel");

	// Add the Y Axis
	svg
		.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + svgSize.margin.left + ',0)')
		.call(yAxis);

	// Y axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', -(svgSize.height - svgSize.margin.bottom) / 2)
		.attr('y', 16)
		.attr('transform', 'rotate(-90)')
		.text('USD - $')
        .attr("class", "axisLabel");

	// title
	svg
		.append('text')
		.attr('x', (svgSize.width - svgSize.margin.left) * 0.8)
		.attr('y', svgSize.margin.top)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text("Fuel prices from '04-20")
        .attr("class", "chartTitle");

	svg
		.append('path')
		.datum(dataset)
		.attr('class', 'line')
		.attr('d', valueline)
		.attr('transform', 'translate(' + svgSize.margin.left + ',0)');

	// Add the valueline2 path.
	svg
		.append('path')
		.datum(dataset)
		.attr('class', 'line')
		.style('stroke', 'red')
		.attr('d', valueline2)
		.attr('transform', 'translate(' + svgSize.margin.left + ',0)');
}

async function getData(url) {
	const response = await fetch(url);
	const str = await response.text();
	return str;
}

function getType(sp, su, wa, mi, pi) {
	//TODO - ihsa
	if (sp == 1) return 'Sports car';
	else if (su == 1) return 'SUV';
	else if (wa == 1) return 'Wagon';
	else if (mi == 1) return 'Minivan';
	else if (pi == 1) return 'Pick-up';
	else return 'Regular';
}

function getColor(type) {
	switch (type) {
		case 'Sports car':
			return 'red';
		case 'SUV':
			return 'black';
		default:
			return 'grey';
	}
}

