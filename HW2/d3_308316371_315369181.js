const task2CSV = 'task_2_output.csv';
const carsCSV = 'cars.csv';
const fuelPrices = 'Fuel_Prices.csv';

const svgSize = {
	width: 1200,
	height: 450,
	margin: {
		left: 50,
		right: 50,
		top: 20,
		bottom: 30,
	},
	padding: 3,
	barPadding: 0.2,
};

const axisTicks = {
	qty: 6,
	outerSize: 0,
};

// buildBarChart();
// buildScatterPlot();
// buildLineChart();

async function buildBarChart() {
	let dataset = await d3.csv(task2CSV);
	dataset = dataset.map((d) => {
		return {
			Type: d.Type,
			RetailPrice: d['Retail.Price'],
			DealerCost: d['Dealer.Cost'],
		};
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

	let container = d3.select('.container');

	let svg = container
		.append('svg')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

	let xScale0 = d3
		.scaleBand()
		.range([
			svgSize.margin.left,
			svgSize.width - svgSize.margin.left - svgSize.margin.right,
		])
		.padding(svgSize.barPadding);
	let xScale1 = d3.scaleBand();
	let yScale = d3
		.scaleLinear()
		.range([svgSize.height - svgSize.margin.top - svgSize.margin.bottom, 0]);

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
			return (
				svgSize.height -
				svgSize.margin.bottom -
				svgSize.margin.top -
				yScale(d.RetailPrice)
			);
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
			return (
				svgSize.height -
				svgSize.margin.bottom -
				svgSize.margin.top -
				yScale(d.DealerCost)
			);
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

	// chart title
	svg
		.append('text')
		.attr('x', svgSize.width / 3)
		.attr('y', svgSize.margin.top)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text('Sales and costs per each vehicle category')
		.attr('font-weight', 700)
		.attr('class', 'chartTitle');

	// Add the X Axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr(
			'transform',
			`translate(0,${
				svgSize.height - svgSize.margin.bottom - svgSize.margin.top
			})`
		)
		.call(xAxis);

	// X axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr(
			'transform',
			'translate(' + svgSize.width / 2.2 + ',' + (svgSize.height - 10) + ')'
		)
		.text('Vehicle category')
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

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
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

	//legend
	let legend = svg
		.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(' + (svgSize.margin.left + 12) + ', 0)');

	legend
		.selectAll('rect')
		.data(['red', 'blue'])
		.enter()
		.append('rect')
		.attr('x', 0)
		.attr('y', function (d, i) {
			return i * 18;
		})
		.attr('width', 12)
		.attr('height', 12)
		.attr('fill', function (d) {
			return d;
		});

	legend
		.selectAll('text')
		.data(['RetailPrice', 'DealerCost'])
		.enter()
		.append('text')
		.text(function (d) {
			return d;
		})
		.attr('x', 18)
		.attr('y', function (d, i) {
			return i * 18;
		})
		.attr('class', 'legendText')
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging');
}

async function buildScatterPlot() {
	var div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip2')
		.style('opacity', 0);

	let padding = 50;

	let dataset = await d3.csv(carsCSV);
	dataset = dataset.map((d) => {
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
		.domain([0, d3.max(dataset, (d) => parseInt(d.hp)) + 25])
		.range([padding, svgSize.width - padding * 2]);

	let yScale = d3
		.scaleLinear()
		.domain([0, d3.max(dataset, (d) => parseInt(d.hwyMPG)) + 5])
		.range([svgSize.height - padding, padding]);

	let rScale = d3
		.scaleLinear()
		.domain([0, d3.max(dataset, (d) => parseInt(d.cylinder))])
		.range([1.5, 5]);

	let container = d3
		.select('.container')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

	let svg = container
		.append('svg')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

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
		.attr(
			'transform',
			'translate(' + svgSize.width / 2.2 + ',' + (svgSize.height - 16) + ')'
		)
		.text('Horse power')
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

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
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

	// title
	svg
		.append('text')
		.attr('x', svgSize.width / 3)
		.attr('y', padding)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text('Horse power to miles per gallon fuel consumption ratio')
		.attr('font-weight', 700)
		.attr('class', 'chartTitle');

	//legend
	let legend = svg
		.append('g')
		.attr('class', 'legend')
		.attr(
			'transform',
			'translate(' +
			(svgSize.margin.left + 12) +
			',' +
			(svgSize.margin.top + 35) +
			')'
		);

	legend
		.selectAll('circle')
		.data(['red', 'black', 'grey', 3, 4, 5, 6, 8, 10, 12])
		.enter()
		.append('circle')
		.attr('cx', function (d, i) {
			if (typeof d == "string")
				return 0;
			else
				return (10 + rScale(d)) * (i - 3);
		})
		.attr('cy', function (d, i) {
			if (typeof d == "string")
				return i * 18;
			else
				return 72;
		})
		.attr('r', function (d) {
			if (typeof d == "string")
				return 5;
			else
				return rScale(d);
		})
		.attr('fill', function (d) {
			if (typeof d == "string")
				return d;
			else
				return "white";
		})
		.attr("stroke", "black")
		.attr('stroke-width', 1);


	// legend
	// 	.selectAll('circle')
	// 	.data([3, 5, 7])
	// 	.enter()
	// 	.append('circle')
	// 	.attr('cx', 0)
	// 	.attr('cy', 72)
	// 	.attr('r', function (d) {
	// 		return d;
	// 	})
	// 	.attr('stroke', "black")
	// 	.attr("fill", "white")
	// 	.attr('stroke-width', 1);

	legend
		.selectAll('text')
		.data(['Sports car', 'SUV', 'other', "size - cylinder:", 3, 5, 8, 12])
		.enter()
		.append('text')
		.text(function (d) {
			return d;
		})
		.attr('x', function (d, i) {
			if (d == "size - cylinder:")
				return 0;
			else if (typeof d == "string")
				return 18;
			else
				return (10 + rScale(d)) * (i - 4) * 2 - 5;
		})
		.attr('y', function (d, i) {
			if (typeof d == "string")
				return i * 18 - 5;
			else
				return 82;
		})
		.attr('class', 'legendText')
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging');
}

async function buildLineChart() {
	let div = d3
		.select('body')
		.append('div')
		.attr('class', 'tooltip2')
		.style('opacity', 0);

	let dates = [];
	let dataset = await d3.csv(fuelPrices);
	dataset = dataset.map((d) => {
		dates.push(new Date(d3.timeParse('%m/%d/%Y')(d['Date'])));
		return {
			date: d3.timeParse('%m/%d/%Y')(d['Date']),
			priceGas: parseFloat(d['Petrol (USD)']),
			priceDiesel: parseFloat(d['Diesel (USD)']),
		};
	});

	let gasMax = d3.max(dataset, function (d) {
		return d.priceGas;
	});

	let dieselMax = d3.max(dataset, function (d) {
		return d.priceDiesel;
	});

	let container = d3
		.select('.container')
		.attr('width', svgSize.width)
		.attr('height', svgSize.height);

	let svg = container
		.append('svg')
		.attr('width', svgSize.width + 50)
		.attr('height', svgSize.height);

	let xScale = d3.scaleTime().range([0, svgSize.width]);

	let yScale = d3
		.scaleLinear()
		.range([svgSize.height - svgSize.margin.bottom - svgSize.margin.top, 0]);

	let color = d3.scaleOrdinal(d3.schemeCategory10);

	xScale.domain(
		d3.extent(dates, function (d) {
			return d;
		})
	);

	yScale.domain([0, dieselMax < gasMax ? gasMax + 15 : dieselMax + 15]);

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
		.attr(
			'transform',
			`translate(${svgSize.margin.left},${
				svgSize.height - svgSize.margin.bottom - svgSize.margin.top
			})`
		)
		.call(xAxis);

	// X axis label
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr(
			'transform',
			'translate(' +
			(svgSize.width - svgSize.margin.left) / 1.7 +
			',' +
			(svgSize.height - svgSize.margin.bottom + svgSize.margin.top) +
			')'
		)
		.text('Years')
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

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
		.attr('font-weight', 700)
		.attr('class', 'axisLabel');

	// title
	svg
		.append('text')
		.attr('x', (svgSize.width - svgSize.margin.left) * 0.5)
		.attr('y', svgSize.margin.top)
		.attr('text-anchor', 'right')
		.style('font-size', '16px')
		.text("Fuel prices from '04-20")
		.attr('font-weight', 700)
		.attr('class', 'chartTitle');

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

	//legend
	let legend = svg
		.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(' + (svgSize.margin.left + 12) + ', 0)');

	legend
		.selectAll('line')
		.data(['red', 'blue'])
		.enter()
		.append('line')
		.attr('x1', 18)
		.attr('y1', function (d, i) {
			return i * 18 + 5;
		})
		.attr('x2', 30)
		.attr('y2', function (d, i) {
			return i * 18 + 5;
		})
		.attr('style', function (d) {
			return 'stroke-width:3; stroke:' + d + ';';
		});

	legend
		.selectAll('text')
		.data(['Petrol', 'Diesel'])
		.enter()
		.append('text')
		.text(function (d) {
			return d;
		})
		.attr('x', 36)
		.attr('y', function (d, i) {
			return i * 18;
		})
		.attr('class', 'legendText')
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'hanging');
}

function getType(sp, su, wa, mi, pi) {
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

async function buttonClick(btn) {
	resetButtonColors();
	let property = document.getElementById(btn);
	property.style.backgroundColor = 'rgba(' + [139, 208, 133].join(',') + ')';
	d3.selectAll('svg').remove();
	if (btn == 'toBar') {
		await buildBarChart();
	} else if (btn == 'toScatter') {
		await buildScatterPlot();
	} else if (btn == 'toLine') {
		await buildLineChart();
	}
}

function resetButtonColors() {
	let elements = document.getElementsByClassName('button'); // get all elements
	for (let i = 0; i < elements.length; i++) {
		elements[i].style.backgroundColor =
			'rgba(' + [255, 255, 255, 0.6].join(',') + ')';
	}
}
