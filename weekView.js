function initWeekView(data, upperInfo) {
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
		"<label class='control-label' for='month'>Months</label>",
		"<select class='form-control' id='month'></select>",
	"</div>"
	].join("\n")).appendTo(panel);
	
	$(["<div class='form-group'>",
		"<label class='control-label' for='week'>Week</label>",
		"<select class='form-control' id='week'>",
		"</select>",
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
	
	$(["<label>Time: </label>",
		"<label id='rangeText'></label>",
		"<div id='timeSlider'></div>"
	].join("\n")).appendTo(panel);
	
	var legendDiv = $("<div id='legend'></div>").appendTo(panel);
	$(legendDiv).append("<label>Legend</label>");
	
	var hourParse = d3.timeParse("%H");
	var timeFormat = d3.timeFormat("%I-%p");
	
    $( "#timeSlider" ).slider({
      range: true,
      min: 0,
      max: 23,
      values: [ 0, 23 ],
      slide: function( event, ui ) {
        $( "#rangeText" ).text( timeFormat(hourParse(ui.values[ 0 ])) + " - " + timeFormat(hourParse(ui.values[ 1 ])) );
      }
    });
	
	$("#timeSlider").mouseup(function() {
		plotDayTimeGraph(data);
	})
	
    $( "#rangeText" ).text( timeFormat(hourParse($( "#timeSlider" ).slider( "values", 0 ))) +
      " - " + timeFormat(hourParse($( "#timeSlider" ).slider( "values", 1 ))) );
	
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
		
	if(upperInfo) {
		category = upperInfo.category;
		categoryValue = upperInfo.categoryValue;
		operation = upperInfo.operation;
		measure = upperInfo.measure;
		year = upperInfo.year;
		month = upperInfo.month;
		
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
		
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});

		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
		
		$('#year').val(upperInfo.year);
		$('#month').val(formatMonthName(new Date(year, month)));
		$('#week').val(upperInfo.week);
		$('#categoryValue').val(upperInfo.categoryValue);
		$('#category').val(upperInfo.category);
		$('#measure').val(upperInfo.measure);
		$('#operation').val(upperInfo.operation);
		
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
		
		month = monthParse($("#month").find(':selected').text()).getMonth();
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});

		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
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
		
		month = monthParse($("#month").find(':selected').text()).getMonth();
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});
		$("#week > option").remove();
		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
			
		plotDayTimeGraph(data);
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
		
		month = monthParse($("#month").find(':selected').text()).getMonth();
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});
		$("#week > option").remove();
		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
		
		plotDayTimeGraph(data);
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
		
		month = monthParse($("#month").find(':selected').text()).getMonth();
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});
		$("#week > option").remove();
		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
		
		plotDayTimeGraph(data);
	});
	
	$("#month").change(function(){
		month = monthParse($("#month").find(':selected').text()).getMonth();
		filteredDataByMonth = filteredDataByYear.filter(function(d){ return month == new Date(d[dataInfo.dateField]).getMonth(); });
		weeks = d3.map(filteredDataByMonth, function(d){return calculateWeek(new Date(d[dataInfo.dateField]));}).keys();
		weeks = weeks.map(Number);
		weeks.sort(function(a, b) {
		  return a - b;
		});
		$("#week > option").remove();
		d3.select("#week").selectAll("option")
				.data(weeks)
				.enter()
				.append("option")
				.text(function(d){return d;});
		
		plotDayTimeGraph(data);
	});
	
	$("#week").change(function(){
		plotDayTimeGraph(data);
	});
	
	$("#measure").change(function(){
		plotDayTimeGraph(data);
	});
	
	$("#operation").change(function(){
		plotDayTimeGraph(data);
	});
			
	plotDayTimeGraph(data);
}


function plotDayTimeGraph(data) {
	$('.mainSVG').remove();
	$('.legendSVG').remove();
	
	var cellSize = 50,
	width = cellSize*24 + 90,
	height = cellSize*7 + 100,
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
				.on("mouseover", function(e){
					tooltip.transition()
					 .duration(200)
					 .style("opacity", .9);
					
					tooltip.html(currentOperation + ": " + v.value[currentOperation])
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
		
	var barMaxLength = 70;
		
	var hourBarData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getHours(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[currentMeasure]; }),
		avg: d3.mean(v, function(d) { return d[currentMeasure]; }),
	  }; })
	  .entries(filteredData);
	  
	var dayBarData = d3.nest()
	  .key(function(d) { return new Date(d[dataInfo.dateField]).getDay(); })
	  .rollup(function(v) { return {
		count: v.length,
		sum: d3.sum(v, function(d) { return d[currentMeasure]; }),
		avg: d3.mean(v, function(d) { return d[currentMeasure]; }),
	  }; })
	  .entries(filteredData);
	  
	var hourBarDataMin = d3.min(hourBarData, function(d){
		return d.value[currentOperation];
	});
	
	var hourBarDataMax = d3.max(hourBarData, function(d){
		return d.value[currentOperation];
	});
	  
	var hourBarScale = d3.scaleLinear().domain([0, hourBarDataMax]).range([0,barMaxLength]);

	hourBarData.forEach(function(d){
		svg.append("rect")
			.attr("width", 20)
			.attr("height", hourBarScale(d.value[currentOperation]))
			.attr("fill", "steelblue")
			.attr("x", cellSize*(parseInt(d.key)+1))
			.attr("y", (8*cellSize+calendarPadding.t+5))	
			.datum(d.value)
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
	
	var dayBarDataMin = d3.min(dayBarData, function(d){
		return d.value[currentOperation];
	});
	
	var dayBarDataMax = d3.max(dayBarData, function(d){
		return d.value[currentOperation];
	});
	
	var dayBarScale = d3.scaleLinear().domain([0, dayBarDataMax]).range([0,barMaxLength]);
	
	dayBarData.forEach(function(d){
		d3.select('g[class="' + (d.key) + '"]').append("rect")
			.attr("width", dayBarScale(d.value[currentOperation]))
			.attr("height", 20)
			.attr("fill", "steelblue")
			.attr("x", cellSize*times.length+5)
			.attr("y", cellSize/4)	
			.datum(d.value)
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
}