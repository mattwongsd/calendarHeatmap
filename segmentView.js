var segmentGraphCount;

function addGraph(data, graphCoordinates, graphVariables) {
	$('.legendSVG').remove();
	
	var width = graphVariables.width;
	var height = graphVariables.height;
	var cellSize = graphVariables.cellSize;
	var newColourScale = graphVariables.colour;
	var year = parseInt(graphVariables.year);
	var month = monthParse($("#month").find(':selected').text()).getMonth();
	var category = graphVariables.category;
	var categoryValue = graphVariables.categoryValue;
	var measure = $("#measure").find(':selected').text();
	var operation = $("#operation").find(':selected').text();
	
	var tooltip = d3.select('.tooltip');
	
	var margin = {r: 30};
	
	var calendar = d3.select(".mainSVG").append("g")
				.attr("width", width+margin.r)
				.attr("height", height)
				.attr("class", (category.replace(/['"]+/g, '') + " " + categoryValue.replace(/['"]+/g, '') + " " + year + " " + month))
				.attr("transform" , "translate(" + 20 + "," + 20 + ")")
				.call(d3.drag()
						.on("drag", dragged));
				
	calendar.append("text")
			.attr("transform", "translate(20,10)")
			.text(category + ": " + categoryValue + " " + year + " " + formatMonthName(new Date(year, month)));
			
	calendar.append("text")
			.attr("transform", "translate(" + (width + margin.r/2) + ",20)")
			.attr("fill", "blue")
			.text("Close")
			.on('click', function(d) {
				segmentGraphCount = segmentGraphCount-1;
				$(this).parent().remove();
			});
		
	var calendarPadding = {l: 20, t: 50};
	
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	days.forEach(function(d, i, arr) {
		calendar.append("text")
			.attr("transform", "translate(" + (cellSize/2 + cellSize*i+calendarPadding.l) + "," + calendarPadding.t/2 + ")")
			.text(d)
			.style("text-anchor", "middle");
	});
	
	var rect = calendar.selectAll("rect")
					.data(d3.timeDays(new Date(year, month), new Date(year, month+1)))
				  .enter().append("rect")
					.attr("width", cellSize)
					.attr("height", cellSize)
					.attr("class", function(d){ return d.getDate(); })
					.attr("fill", "#fff")
					.style("stroke", "#ccc")
					.attr("x", function(d) { return d3.timeDay.count(d3.timeSunday(d), d) * cellSize + calendarPadding.l; })
					.attr("y", function(d) { return d3.timeSunday.count(d3.timeMonth(d), d) * cellSize + calendarPadding.t; });
	
	var filteredData = data.filter(function(d){
		var date = new Date(d[dataInfo.dateField]);
		return date.getFullYear() == year && d[category] == categoryValue && date.getMonth() == month;
	});
	
	var requiredData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDate(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[measure]; }),
		avg: d3.mean(v, function(d) { return d[measure]; }),
	  }; })
	.entries(filteredData);
	
	var min = d3.min(requiredData, function(d){
		return d.value[operation];
	});
	
	var max = d3.max(requiredData, function(d){
		return d.value[operation];
	});
	
	var newColourScale = graphVariables.colourScale;
	var currentDomainMin = newColourScale.domain()[0];
	
	var currentDomainMax = newColourScale.domain()[1];
	if (min < currentDomainMin) {
		currentDomainMin = min;
	}
	if (max > currentDomainMax) {
		currentDomainMax = max;
	}
	newColourScale.domain([currentDomainMin, currentDomainMax]);
	
	requiredData.forEach(function(d){
		d3.select("[class='" + (category.replace(/['"]+/g, '') + " " + categoryValue.replace(/['"]+/g, '')) + " " + year + " " + month + "'] > rect[class='" + new Date(year, month, d.key).getDate() + "']")
			.attr("fill", newColourScale(d.value[operation]))
			.classed('rectWithValue', true)
			.datum(d)
			.on("mouseover", function(e){
				tooltip.transition()
				 .duration(200)
				 .style("opacity", .9);
				
				tooltip.html("Date: " + (new Date(year, parseInt(month), e.key)).getDate() + "<br>" + operation + ": " + e.value[operation])
				 .style("left", (d3.event.pageX) + "px")
				 .style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d){
				tooltip.transition()
				 .duration(500)
				 .style("opacity", 0);
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
						 .attr("stop-color", newColourScale(currentDomainMin))
						 .attr("stop-opacity", 1);

	legend.append("stop").attr("offset", "100%")
						 .attr("stop-color", newColourScale(currentDomainMax))
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
	
	d3.selectAll('.rectWithValue').attr("fill", function(d) {
		return newColourScale(d.value[operation]);
	})
	
	var returnObject = {};
	returnObject.newColourScale = newColourScale;
	
	
	var barMaxLength = 70;
		
	var weekBarData = d3.nest()
	  .key(function(d) { return calculateWeek(new Date(d[dataInfo.dateField])); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[measure]; }),
		avg: d3.mean(v, function(d) { return d[measure]; }),
	  }; })
	  .entries(filteredData);
	  
	var dayBarData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDay(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[measure]; }),
		avg: d3.mean(v, function(d) { return d[measure]; }),
	  }; })
	  .entries(filteredData);
	  
	var weekBarDataMin = d3.min(weekBarData, function(d){
		return d.value[operation];
	});
	
	var weekBarDataMax = d3.max(weekBarData, function(d){
		return d.value[operation];
	});
	  
	var weekBarScale = d3.scaleLinear().domain([0, weekBarDataMax]).range([0,barMaxLength]);

	weekBarData.forEach(function(d){
		d3.select("[class='" + (category.replace(/['"]+/g, '') + " " + categoryValue.replace(/['"]+/g, '')) + " " + year + " " + month + "']")
			.append("rect")
			.attr("width", weekBarScale(d.value[operation]))
			.attr("height", 20)
			.attr("fill", "steelblue")
			.attr("x", (7*cellSize+calendarPadding.l+5))
			.attr("y", cellSize*(d.key-1)+calendarPadding.t+cellSize/4)	
			.datum(d.value)
			.on("mouseover", function(d){
				tooltip.transition()
				 .duration(200)
				 .style("opacity", .9);
				
				tooltip.html(operation + ": " + d[operation])
				 .style("left", (d3.event.pageX) + "px")
				 .style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d){
				tooltip.transition()
				 .duration(500)
				 .style("opacity", 0);
			});
	});
	
	var dayBarDataMin = d3.min(dayBarData, function(d){
		return d.value[operation];
	});
	
	var dayBarDataMax = d3.max(dayBarData, function(d){
		return d.value[operation];
	});
	
	var dayBarScale = d3.scaleLinear().domain([0, dayBarDataMax]).range([0,barMaxLength]);

	dayBarData.forEach(function(d){
		var noOfWeeks = weekCount(year, parseInt(month)+1);
		d3.select("[class='" + (category.replace(/['"]+/g, '') + " " + categoryValue.replace(/['"]+/g, '')) + " " + year + " " + month + "']")
			.append("rect")
			.attr("width",  20)
			.attr("height", dayBarScale(d.value[operation]))
			.attr("fill", "steelblue")
			.attr("x", cellSize*(d.key)+calendarPadding.l+cellSize/4)
			.attr("y", calendarPadding.t+noOfWeeks*cellSize+5)	
			.datum(d.value)
				.on("mouseover", function(e){
					tooltip.transition()
					 .duration(200)
					 .style("opacity", .9);
					
					tooltip.html(operation + ": " + e[operation])
					 .style("left", (d3.event.pageX) + "px")
					 .style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", function(e){
					tooltip.transition()
					 .duration(500)
					 .style("opacity", 0);
				});
	});
	
	return returnObject;
		
} // function addGraph

function initSegmentView(data) {	
	$('.tooltip').remove();
	$(".mainSVG").remove();
	segmentGraphCount = 0;
	
	var currentWidth = 0;
	var currentHeight = 0;
	var cellSize = 50,
		width = cellSize*7 + 50,
		height = cellSize*7 + 80,
		svgWidth = 1500,
		svgHeight = 1500,
		margin = {t:20, b:20, l:20, r:20};
	
	var panel = $('#leftPanelBody');
	
	$(["<div class='form-group'>",
			"<label class='control-label' for='view'>View</label>",
			"<select class='form-control' id='view'>",
			"</select>",
		"</div>"
	].join("\n")).appendTo(panel);
	
	initViewListener(data);
	$('#view').val('Segment');
	
	var modal = $([
			'<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modalLabel">',
				'<div class="modal-dialog" role="document">',
					'<div class="modal-content">',
						'<div class="modal-header">',
							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
							'<h4 class="modal-title" id="modalLabel">Adding Graph Options</h4>',
						'</div>',
					'<div class="modal-body">',
					'</div>',
					'<div class="modal-footer">',
						'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
						'<button id="plotButton" type="button" class="btn btn-primary">Add Graph</button>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
		].join("\n"));
		
	modal.appendTo(panel);
	
	var modalContent = $('.modal-body');
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='category'>Category</label>",
		"<select class='form-control' id='category'></select>",
	"</div>"
	].join("\n")).appendTo(modalContent);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='categoryValue'>Category Value</label>",
		"<select class='form-control' id='categoryValue'></select>",
	"</div>"
	].join("\n")).appendTo(modalContent);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='year'>Year</label>",
		"<select class='form-control' id='year'></select>",
	"</div>"
	].join("\n")).appendTo(modalContent);	
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='month'>Month</label>",
		"<select class='form-control' id='month'></select>",
	"</div>"
	].join("\n")).appendTo(modalContent);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='measure'>Measure</label>",
		"<select class='form-control' id='measure'>",
		"</select>",
	"</div>"
	].join("\n")).appendTo($("#leftPanelBody"));
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='operation'>Operation</label>",
		"<select class='form-control' id='operation'>",
			"<option>count</option>",
			"<option>avg</option>",
			"<option>sum</option>",
		"</select>",
	"</div>"
	].join("\n")).appendTo($("#leftPanelBody"));
	
	var legendDiv = $("<div id='legend'></div>").appendTo($("#leftPanelBody"));
	$(legendDiv).append("<label>Legend</label>");
	
	d3.select("#measure").selectAll("option")
			.data(dataInfo.measures.sort())
			.enter()
			.append("option")
			.text(function(d){return d;});
	
	var filteredDataByCategoryValue;
	var filteredDataByYear;
	var category = '';
	var categoryValue = '';
	var years = [];
	var year = '';
	var months = [];
	var month = '';
	
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
			
		$("#month > option").remove();
		year = $("#year").find(':selected').text();
		filteredDataByYear = filteredDataByCategoryValue.filter(function(d){ return year == new Date(d[dataInfo.dateField]).getFullYear(); });
		months = d3.map(filteredDataByYear, function(d){return new Date(d[dataInfo.dateField]).getMonth();}).keys();
		months = months.map(Number);
		months.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#month").selectAll("option")
			.data(months)
			.enter()
			.append("option")
			.text(function(d){return formatMonthName(new Date(year, d));});
	});
	
	$("#categoryValue").change(function(){
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
		
		$("#month > option").remove();
		year = $("#year").find(':selected').text();
		filteredDataByYear = filteredDataByCategoryValue.filter(function(d){ return year == new Date(d[dataInfo.dateField]).getFullYear(); });
		months = d3.map(filteredDataByYear, function(d){return new Date(d[dataInfo.dateField]).getMonth();}).keys();
		months = months.map(Number);
		months.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#month").selectAll("option")
			.data(months)
			.enter()
			.append("option")
			.text(function(d){return formatMonthName(new Date(year, d));});
	});
	
	$("#year").change(function(){
		year = $("#year").find(':selected').text();
		filteredDataByYear = filteredDataByCategoryValue.filter(function(d){ return year == new Date(d[dataInfo.dateField]).getFullYear(); });
		months = d3.map(filteredDataByYear, function(d){return new Date(d[dataInfo.dateField]).getMonth();}).keys();
		months = months.map(Number);
		months.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#month").selectAll("option")
			.data(months)
			.enter()
			.append("option")
			.text(function(d){return formatMonthName(new Date(year, d));});
	});
	
	$("#measure").change(function(){
		$('.mainSVG').children().remove();
	});
	
	$("#operation").change(function(){
		$('.mainSVG').children().remove();
	});
	
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
			
	
			
	year = $("#year").find(':selected').text();
		filteredDataByYear = filteredDataByCategoryValue.filter(function(d){ return year == new Date(d[dataInfo.dateField]).getFullYear(); });
		months = d3.map(filteredDataByYear, function(d){return new Date(d[dataInfo.dateField]).getMonth();}).keys();
		months = months.map(Number);
		months.sort(function(a, b) {
		  return a - b;
		});
		d3.select("#month").selectAll("option")
			.data(months)
			.enter()
			.append("option")
			.text(function(d){return formatMonthName(new Date(year, d));});
	
	var svg = d3.select("#rightPanel")
					.append("svg")
					.classed("mainSVG", true)
					.attr("width", svgWidth)
					.attr("height", svgHeight);
					
	var tooltip = d3.select('.tooltip');
	
	var colour = d3.scaleSequential(d3.interpolateOranges);
	
	var addGraphButton = $( "<button>", {
						"class": "btn btn-primary",
						"id": "addGraph",
						"data-toggle":"modal",
						"data-target":"#modal"
	}).appendTo(panel);
		
	addGraphButton.html("Add graph");
	
	var tooltip = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);
	
	$('#plotButton').on("click", function(){
		var graphCoordinates = {};
		var graphVariables = {};
		
		graphVariables.cellSize = 50;
		graphVariables.width = cellSize*7 + 50;
		graphVariables.height = cellSize*7 + 80;
		graphVariables.category = $("#category").find(':selected').text();
		graphVariables.categoryValue = $("#categoryValue").find(':selected').text();
		graphVariables.year = $("#year").find(':selected').text();
		graphVariables.month = $("#month").find(':selected').text();
		graphVariables.colourScale = colour;
		
		
		var returnObject = addGraph(data, graphCoordinates, graphVariables);
		graphCoordinates.x = margin.l;
		graphCoordinates.y = margin.t;
		/*
		console.log(segmentGraphCount)
		segmentGraphCount++;
		currentWidth = segmentGraphCount *( width + margin.l + margin.r);
		if (currentWidth + width + margin.l + margin.r > svgWidth) {
			currentWidth = 0;
			segmentGraphCount = 0;
			currentHeight += height + margin.t;
		}*/
		
		colour = returnObject.newColourScale;
	});
	
} // function initSegmentView