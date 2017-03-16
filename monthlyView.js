function initMonthlyView(data, upperInfo) {	
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
	$('#view').val('Monthly');
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='category'>Category</label>",
		"<select class='form-control' id='category'></select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='categoryValue'>Category Value</label>",
		"<select class='form-control' id='categoryValue'></select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='year'>Year</label>",
		"<select class='form-control' id='year'></select>",
	"</div>"
	].join("\n")).appendTo(panel);	
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='month'>Months</label>",
		"<select class='form-control' multiple='multiple' id='month'></select>",
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
	
	d3.select("#measure").selectAll("option")
			.data(dataInfo.measures)
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
	
	d3.select("#category").selectAll("option")
		.data(dataInfo.categories.sort())
		.enter()
		.append("option")
		.text(function(d){return d;});
	
	if(upperInfo) {
		year = upperInfo.year;
		category = upperInfo.category;
		categoryValue = upperInfo.categoryValue;
		measure = upperInfo.measure;
		operation = upperInfo.operation
		
		d3.select("#categoryValue").selectAll("option")
			.data(d3.map(data, function(d){return d[category];}).keys().sort())
			.enter()
			.append("option")
			.text(function(d){return d;});
		
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
			
		$('#month').multiselect();
		
		$('#year').val(upperInfo.year);
		$('#categoryValue').val(upperInfo.categoryValue);
		$('#category').val(upperInfo.category);
		$('#measure').val(upperInfo.measure);
		$('#operation').val(upperInfo.operation);
		
		plotPivotGraph(data);
		
	} else {
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
				
		$('#month').multiselect();
	}
	
	
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
		$("#month").multiselect('destroy');
		$("#month").multiselect();
			
		plotPivotGraph(data);
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
		$("#month").multiselect('destroy');
		$("#month").multiselect();
			
		plotPivotGraph(data);
	});
	
	$("#year").change(function(){
		year = $("#year").find(':selected').text();
		filteredDataByYear = filteredDataByCategoryValue.filter(function(d){ return year == new Date(d[dataInfo.dateField]).getFullYear(); });
		months = d3.map(filteredDataByYear, function(d){return new Date(d[dataInfo.dateField]).getMonth();}).keys();
		months = months.map(Number);
		months.sort(function(a, b) {
		  return a - b;
		});
		
		$("#month > option").remove();
		d3.select("#month").selectAll("option")
			.data(months)
			.enter()
			.append("option")
			.text(function(d){return formatMonthName(new Date(year, d));});
		$("#month").multiselect('destroy');
		$("#month").multiselect();
		plotPivotGraph(data);
	});
	
	$("#month").change(function(){
		plotPivotGraph(data);
	});
	
	$("#measure").change(function(){
		plotPivotGraph(data);
	});
	
	$("#operation").change(function(){
		plotPivotGraph(data);
	});
	
	var drillIn = $( "<button>", {
					"class": "btn btn-default",
					"id": "drillIn",
					"data-toggle":"button",
					"aria-pressed":false
	}).appendTo(panel);
	
	drillIn.html("Drill into week");
	
	drillIn.on("click", function(){
		if (drillInMode == true) {
			drillInMode = false;
		} else {
			drillInMode = true;
		}
	});
}



function plotPivotGraph(data) {
	//Clear the svg
	$(".mainSVG").remove();
	$(".legendSVG").remove();
	
	var months = $("#month").find(':selected').map(function(a, item){return monthParse(item.value).getMonth();});
	months = $.makeArray(months);
	months = months.map(Number);
	months.sort(function(a, b) {
	  return a - b;
	});
	
	var cellSize = 50,
	width = cellSize*7 + 90,
	height = cellSize*6 + 100,
	svgWidth = 1500,
	svgHeight = 1500,
	margin = {t:20, b:20, l:20, r:20};
	
	var svg = d3.select("#rightPanel")
				.append("svg")
				.classed("mainSVG", true)
				.attr("width", svgWidth)
				.attr("height", svgHeight);

	var level = 0;
	var currentWidth = 0;
	var calendarGroup = svg.selectAll("g")
				.data(months)
			  .enter().append("g")
				.attr("width", width)
				.attr("height", height)
				.attr("class", function(d){ return d; })
				.attr("transform" , function(d,i) {
					var toReturn;
					if (currentWidth + width + margin.l + margin.r > svgWidth) {
						currentWidth = 0;
						level += 1;
					}
					toReturn = "translate(" + currentWidth + "," + (level*height + margin.t + margin.b) + ")";
					currentWidth += width + margin.l + margin.r;
					return toReturn;
				})
				.call(d3.drag()
						.on("drag", dragged));
	
	var monthFormat = d3.timeFormat("%B");
	calendarGroup.append("text")
		.attr("transform", "translate(20,10)")
		.text(function(d) { return monthFormat(new Date(2015, d)); });
	
	var calendarPadding = {l: 20, t: 50};
	
	var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	days.forEach(function(d, i, arr) {
		calendarGroup.append("text")
			.attr("transform", "translate(" + (cellSize/2 + cellSize*i+calendarPadding.l) + "," + calendarPadding.t/2 + ")")
			.text(d)
			.style("text-anchor", "middle");
	});
	
	var currentYear = $("#year").find(':selected').text();
	var rect = calendarGroup.selectAll("rect")
				.data(function(d) { return d3.timeDays(new Date(currentYear, d), new Date(currentYear, d+1)); })
			  .enter().append("rect")
				.attr("width", cellSize)
				.attr("height", cellSize)
				.attr("class", function(d){ return d.getDate(); })
				.attr("fill", "#fff")
				.style("stroke", "#ccc")
				.attr("x", function(d) { return d3.timeDay.count(d3.timeSunday(d), d) * cellSize + calendarPadding.l; })
				.attr("y", function(d) { return d3.timeSunday.count(d3.timeMonth(d), d) * cellSize + calendarPadding.t; });
	
	var categoryValue = $("#categoryValue").find(':selected').text();	
	var category = $("#category").find(':selected').text();
	var currentMeasure = $("#measure").find(':selected').text();
	var currentOperation = $("#operation").find(':selected').text();
	
	var filteredData = data.filter(function(d){
		var date = new Date(d[dataInfo.dateField]);
		return date.getFullYear() == currentYear && d[category] == categoryValue;
	});
	
	var colour = d3.scaleSequential(d3.interpolateOranges);
	
	var requiredData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getMonth(); })
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDate(); })
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
	
	var barMaxLength = 70;
		
	var weekBarData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getMonth(); })
	  .key(function(d) { return calculateWeek(new Date(d[dataInfo.dateField])); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[currentMeasure]; }),
		avg: d3.mean(v, function(d) { return d[currentMeasure]; }),
	  }; })
	  .entries(filteredData);
	  
	var dayBarData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getMonth(); })
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDay(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[currentMeasure]; }),
		avg: d3.mean(v, function(d) { return d[currentMeasure]; }),
	  }; })
	  .entries(filteredData);
	  
	var weekBarDataMin = d3.min(weekBarData, function(d){
		return d3.min(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	
	var weekBarDataMax = d3.max(weekBarData, function(d){
		return d3.max(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	  
	var weekBarScale = d3.scaleLinear().domain([0, weekBarDataMax]).range([0,barMaxLength]);

	weekBarData.forEach(function(d){
		d.values.forEach(function(v){
			d3.select('g[class="' + d.key + '"]').append("rect")
				.attr("width", function(d) { return weekBarScale(v.value[currentOperation]); })
				.attr("height", 20)
				.attr("fill", "steelblue")
				.attr("x", (7*cellSize+calendarPadding.l+5))
				.attr("y", function(d) { return (cellSize*(v.key-1)+calendarPadding.t+cellSize/4); })	
				.datum(v.value)
				.on("mouseover", function(d){
					tooltip.transition()
					 .duration(200)
					 .style("opacity", .9);
					
					tooltip.html(currentOperation + ": " + d[currentOperation])
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
	
	var dayBarDataMin = d3.min(dayBarData, function(d){
		return d3.min(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	
	var dayBarDataMax = d3.max(dayBarData, function(d){
		return d3.max(d.values, function(v){
			return v.value[currentOperation];
		})
	});
	
	var dayBarScale = d3.scaleLinear().domain([0, dayBarDataMax]).range([0,barMaxLength]);
	
	dayBarData.forEach(function(d){
		var noOfWeeks = weekCount(currentYear, parseInt(d.key)+1);
		d.values.forEach(function(v){
			d3.select('g[class="' + (d.key) + '"]').append("rect")
				.attr("width",  20)
				.attr("height", function(d) { return dayBarScale(v.value[currentOperation]);})
				.attr("fill", "steelblue")
				.attr("x", function(d) { return (cellSize*(v.key)+calendarPadding.l+cellSize/4); })
				.attr("y", function(d) { return (calendarPadding.t+noOfWeeks*cellSize+5); })	
				.datum(v.value)
					.on("mouseover", function(d){
						tooltip.transition()
						 .duration(200)
						 .style("opacity", .9);
						
						tooltip.html(currentOperation + ": " + d[currentOperation])
						 .style("left", (d3.event.pageX) + "px")
						 .style("top", (d3.event.pageY - 28) + "px");
					})
					.on("mouseout", function(d){
						tooltip.transition()
						 .duration(500)
						 .style("opacity", 0);
					});;
		});
	});
	
	colour.domain([min, max]);
	
	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	requiredData.forEach(function(d){
		d.values.forEach(function(v){
			d3.select("[class='" + d.key + "'] > rect[class='" + v.key + "']")
				.attr("fill", colour(v.value[currentOperation]))
				.datum(v)
				.on("mouseover", function(e){
					tooltip.transition()
					 .duration(200)
					 .style("opacity", .9);
					
					tooltip.html("Date: " + (new Date(currentYear, parseInt(d.key), e.key)).getDate() + "<br>" + currentOperation + ": " + v.value[currentOperation])
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
	
	$(".mainSVG > g > rect").on("click", function(e){
		if (drillInMode == true) {
			drillInMode = false;
			var upperInfo = {};
			upperInfo.categoryValue = $("#categoryValue").find(':selected').text();
			upperInfo.category = $("#category").find(':selected').text();
			upperInfo.year = $("#year").find(':selected').text();
			upperInfo.month = parseInt($(this).parent().attr("class"));
			upperInfo.measure = $("#measure").find(':selected').text();
			upperInfo.operation = $("#operation").find(':selected').text();
			upperInfo.week = calculateWeek(new Date(upperInfo.year, upperInfo.month, $(this).attr("class")));
			$(".mainSVG").remove();
			$("#leftPanelBody").children().remove();
			tooltip.remove();
			initWeekView(data, upperInfo);
		}		
	});

}