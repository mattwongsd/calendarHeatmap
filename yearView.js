function initYearView(data, upperInfo) {
	$('.tooltip').remove();
	$(".mainSVG").remove();
	var panel = $('#leftPanelBody');
	
	$(["<div class='form-group'>",
			"<label class='control-label' for='view'>View</label>",
			"<select class='form-control' id='view'>",
			"</select>",
		"</div>"
	].join("\n")).appendTo(panel);
	
	initViewListener(data);
	$('#view').val('Week');
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='category'>Category</label>",
		"<select class='form-control' id='category'></select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='categoryValue'>Category Value</label>",
		"<select class='form-control'' id='categoryValue'></select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='year'>Year</label>",
		"<select class='form-control' id='year'></select>",
	"</div>"
	].join("\n")).appendTo(panel);	
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='measure'>Measure</label>",
		"<select class='form-control' id='measure'>",
		"</select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='operation'>Operation</label>",
		"<select class='form-control' id='operation'>",
			"<option>count</option>",
			"<option>avg</option>",
			"<option>sum</option>",
		"</select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	var legendDiv = $("<div id='legend'></div>").appendTo(panel);
	$(legendDiv).append("<label>Legend</label>");
	
	var hourParse = d3.timeParse("%H");
	var timeFormat = d3.timeFormat("%I-%p");
	
	d3.select("#measure").selectAll("option")
			.data(dataInfo.measures.sort())
			.enter()
			.append("option")
			.text(function(d){return d;});
	
	var filteredDataByCategoryValue;
	var filteredDataByYear;
	var filteredDataByMonth;
	var category = '';
	var categoryValue = '';
	var years = [];
	var year = '';
	var months = [];
	var month = '';
	
	d3.select("#category").selectAll("option")
		.data(dataInfo.categories.sort())
		.enter()
		.append("option")
		.text(function(d){return d;});

	category = $("#category").find(':selected').text();
	d3.select("#categoryValue").selectAll("option")
		.data(d3.map(data, function(d){return d[category];}).keys().sort())
		.enter()
		.append("option")
		.text(function(d){return d;});
		
	categoryValue = $("#categoryValue").find(':selected').text();
		filteredDataByCategoryValue = data.filter(function(d){ return categoryValue == d[category]; });
		years = d3.map(filteredDataByCategoryValue, function(d){return new Date(d[dataInfo.dateField]).getFullYear();}).keys();
		years = years.map(Number);
		years.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#year").selectAll("option")
			.data(years)
			.enter()
			.append("option")
			.text(function(d){return d;});
	
	$("#category").change(function(){
		$("#categoryValue > option").remove();
		category = $("#category").find(':selected').text();
		d3.select("#categoryValue").selectAll("option")
			.data(d3.map(data, function(d){return d[category];}).keys().sort())
			.enter()
			.append("option")
			.text(function(d){return d;});
		
		$("#year > option").remove();
		categoryValue = $("#categoryValue").find(':selected').text();
		filteredDataByCategoryValue = data.filter(function(d){ return categoryValue == d[category]; });
		years = d3.map(filteredDataByCategoryValue, function(d){return new Date(d[dataInfo.dateField]).getFullYear();}).keys();
		years = years.map(Number);
		years.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#year").selectAll("option")
			.data(years)
			.enter()
			.append("option")
			.text(function(d){return d;});
		
		plotYearGraph(data);
	});
	
	$("#categoryValue").change(function(){
		$("#year > option").remove();
		console.log("change");
		categoryValue = $("#categoryValue").find(':selected').text();
		filteredDataByCategoryValue = data.filter(function(d){ return categoryValue == d[category]; });
		years = d3.map(filteredDataByCategoryValue, function(d){return new Date(d[dataInfo.dateField]).getFullYear();}).keys();
		years = years.map(Number);
		years.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#year").selectAll("option")
			.data(years)
			.enter()
			.append("option")
			.text(function(d){return d;});
		
		plotYearGraph(data);
	});
	
	$("#year").change(function(){
		plotYearGraph(data);
	});
	
	$("#measure").change(function(){
		plotYearGraph(data);
	});
	
	$("#operation").change(function(){
		plotYearGraph(data);
	});
			
	plotYearGraph(data);
}


function plotDayTimeGraph(data) {
	$('.mainSVG').remove();
	$('.legendSVG').remove();
	
	var cellSize = 50,
	width = cellSize*24 + 50,
	height = cellSize*7 + 80,
	svgWidth = width + 200,
	svgHeight = height + 300,
	margin = {t:50, b:20, l:20, r:20};
	
	var currentYear = $("#year").find(':selected').text();
	var category = $("#category").find(':selected').text();
	var categoryValue = $("#categoryValue").find(':selected').text();
	var currentMonth = monthParse($("#month").find(':selected').text()).getMonth();
	var currentMeasure = $("#measure").find(':selected').text();
	var currentOperation = $("#operation").find(':selected').text();
	var week = $("#week").find(':selected').text();
	
	var svg = d3.select("#rightPanel")
				.append("svg")
				.classed("mainSVG", true)
				.attr("width", svgWidth)
				.attr("height", svgHeight);
				
	var calendarPadding = {l: 20, t: 50};
	
	var calendarGroup = svg.selectAll("g")
				.data(d3.range(0,7,1))
			  .enter().append("g")
				.classed('noBorder', true)
				.attr("width", width)
				.attr("height", height)
				.attr("class", function(d){ return d; })
				.attr("transform" , function(d,i) {
					var toReturn = "translate(" + (margin.l+calendarPadding.l) + "," + (margin.t+cellSize*i+calendarPadding.t) + ")";
					return toReturn;
	});

	svg.append("text")
		.attr("transform", "translate(20,20)")
		.text(categoryValue);
	
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	days.forEach(function(d, i, arr) {
		svg.append("text")
			.attr("transform", "translate(" + (calendarPadding.l) + "," + (cellSize/2 + cellSize*i + calendarPadding.t + margin.t) + ")")
			.text(d)
			.style("text-anchor", "middle");
	});
	
	var hourParse = d3.timeParse("%H");
	var timeFormat = d3.timeFormat("%I-%p");
	
	var times = [$( "#timeSlider" ).slider( "values", 0 ), $( "#timeSlider" ).slider( "values", 1 )];
	times = d3.range(times[0], times[1]+1, 1);
	times.forEach(function(d, i, arr) {
		svg.append("text")
			.attr("transform", "translate(" + (margin.l + cellSize/2 + cellSize*i + calendarPadding.l) + "," + (calendarPadding.t/2+margin.t) + ")")
			.text(timeFormat(hourParse(d)))
			.style("text-anchor", "middle");
	});
	
	var rect = calendarGroup.selectAll("rect")
				.data(times)
			  .enter().append("rect")
				.attr("width", cellSize)
				.attr("height", cellSize)
				.attr("class", function(d){ return d; })
				.attr("fill", "#fff")
				.style("stroke", "#ccc")
				.attr("x", function(d, i) { return i*cellSize; });		
	
	var filteredData = data.filter(function(d){
		var date = new Date(d[dataInfo.dateField]);
		return date.getMonth() == currentMonth && date.getFullYear() == currentYear && d[category] == categoryValue && calculateWeek(new Date(d[dataInfo.dateField])) == parseInt(week) && $.inArray(new Date(d[dataInfo.dateField]).getHours(), times) > -1;
	});
	
	
	var colour = d3.scaleSequential(d3.interpolateOranges);
	
	var requiredData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDay(); })
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getHours(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[currentMeasure]; }),
		avg: d3.mean(v, function(d) { return d[currentMeasure]; }),
	  }; })
	  .entries(filteredData);
	
	var min = d3.min(requiredData, function(d){
		return d3.min(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	
	var max = d3.max(requiredData, function(d){
		return d3.max(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	
	colour.domain([min, max]);
	
	requiredData.forEach(function(d){
		d.values.forEach(function(v){
			d3.select("[class='" + d.key + "'] > rect[class='" + v.key + "']")
				.attr("fill", colour(v.value[currentOperation]))
				.datum(function(date){
					return {
						data: v.value[currentOperation]
					}
				})
				.on("mouseover", function(d){
					tooltip.transition()
					 .duration(200)
					 .style("opacity", .9);
					
					tooltip.html(currentOperation + ": " + d.data)
					 .style("left", (d3.event.pageX) + "px")
					 .style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", function(d){
					tooltip.transition()
					 .duration(500)
					 .style("opacity", 0);
				});
		});
	});
	
	var legendWidth = 200;
	var legendHeight = 300;
	var legendSVG = d3.select("#legend").append("svg")
						.attr("width", legendWidth)
						.attr("height", legendHeight)
						.classed("legendSVG", true);
	
	var legend = legendSVG.append("defs")
					 .append("svg:linearGradient")
					 .attr("id", "gradient")
					 .attr("x1", "100%")
					 .attr("y1", "0%")
					 .attr("x2", "100%")
					 .attr("y2", "100%")
					 .attr("spreadMethod", "pad");
	
	legend.append("stop").attr("offset", "0%")
						 .attr("stop-color", colour(min))
						 .attr("stop-opacity", 1);

	legend.append("stop").attr("offset", "100%")
						 .attr("stop-color", colour(max))
						 .attr("stop-opacity", 1);

	legendSVG.append("rect").attr("width", 40)
					  .attr("height", legendHeight-50)
					  .style("fill", "url(#gradient)")
					  .attr("transform", "translate(" + legendWidth/2 + ",20)");
	
	var colourAxisScale = d3.scaleLinear().domain([min,max]).range([0,legendHeight-50]);
	
	var legendAxis = d3.axisLeft().scale(colourAxisScale).ticks(5);

	legendSVG.append("g").attr("class", "y axis")
							.attr("transform", "translate(" + (legendWidth/2+1) + ",20)")
							.call(legendAxis);
	
	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
}