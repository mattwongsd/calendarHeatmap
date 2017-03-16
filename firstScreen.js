function firstScreen(columns, data) {		
	var title = "<h3> Please select measures and categories </h3>";
	$("#inputRow").append(title);
	
	var table = document.createElement("table");
	$(table).attr("id", "columnTable");
	$(table).addClass("table table-condensed table-nonfluid");
	$(table).append("<thead><tr><td><b>Columns</b></td></tr></thead>");
	
	// populate the table with the columns in the csv file
	columns.forEach(function(column, index) {
		$(table).append("<tr><td>" + column + "</td></tr>");
	});
	$("#columnTableDiv").append(table);
	
	var measuresTable = document.createElement("table");
	$(measuresTable).attr("id", "measuresTable");
	$(measuresTable).addClass("table table-condensed table-nonfluid");
	$(measuresTable).append("<thead><tr><td><b>Measures</b></td></tr></thead>");
	$("#measureTableDiv").append(measuresTable);
	
	var categoriesTable = document.createElement("table");
	$(categoriesTable).attr("id", "categoriesTable");
	$(categoriesTable).addClass("table table-condensed table-nonfluid");
	$(categoriesTable).append("<thead><tr><td><b>Categories</b></td></tr></thead>");
	$("#categoryTableDiv").append(categoriesTable);
	
	var timeFieldTable = document.createElement("table");
	$(timeFieldTable).attr("id", "timeFieldTable");
	$(timeFieldTable).addClass("table table-condensed table-nonfluid");
	$(timeFieldTable).append("<thead><tr><td><b>Time Field</b></td></tr></thead>");
	$("#timeFieldTableDiv").append(timeFieldTable);
	
	/* Get all rows from your 'table' but not the first one 
	* that includes headers. */
	var rows = $('#columnTable tr').not(':first');

	/* Create 'click' event handler for rows */
	rows.on('click', function(e) {
		/* Get current row */
		var row = $(this);

		/* Check if 'Ctrl', 'cmd' or 'Shift' keyboard key was pressed
		* 'Ctrl' => is represented by 'e.ctrlKey' or 'e.metaKey'
		* 'Shift' => is represented by 'e.shiftKey' */
		if ((e.ctrlKey || e.metaKey) || e.shiftKey) {
			/* If pressed highlight the other row that was clicked */
			row.addClass('highlight');
		} else {
		/* Otherwise just highlight one row and clean others */
			rows.removeClass('highlight');
			row.addClass('highlight');
		}
	});	
	
	var addToMeasuresButton = document.createElement("button");
	$(addToMeasuresButton).addClass("btn btn-primary");
	addToMeasuresButton.innerHTML = "Add to measures";
	$(addToMeasuresButton).on("click", function(){
		addColumn(table, measuresTable)
	});
	
	var addToCategoriesButton = document.createElement("button");
	$(addToCategoriesButton).addClass("btn btn-primary");
	addToCategoriesButton.innerHTML = "Add to categories";
	$(addToCategoriesButton).on("click", function(){
		addColumn(table, categoriesTable)
	});
	
	var addToTimeFieldButton = document.createElement("button");
	$(addToTimeFieldButton).addClass("btn btn-primary");
	addToTimeFieldButton.innerHTML = "Select Time field";
	$(addToTimeFieldButton).on("click", function(){
		addColumn(table, timeFieldTable)
	});
	
	var plotGraphButton = document.createElement("button");
	$(plotGraphButton).addClass("btn btn-success");
	plotGraphButton.innerHTML = "Plot calendar heatmap";
	$(plotGraphButton).on("click", function() {
		if ($("#categoriesTable td").length <= 1 || $("#measuresTable td").length <= 1) {
			alert("please fill out measures or categories table");
		}
		else if ($("#timeFieldTable td").length != 2) {
			alert("please ensure there is only one time field for your data");
		}
		else {
			dataInfo = initData();
			$("body").children().remove();
			
			//NEW
			var container = $("<div/>", {
						"class": "container-fluid",
						"id": "container",
			}).appendTo("body");
			
			var containerRow = $("<div/>", {
							"class": "row",
							"id": "containerRow1",
			}).appendTo(container);
			
			var leftPanel = $("<div/>", {
							"class": "col-md-3",
							"id": "leftPanel",
			}).appendTo(containerRow);
			
			var rightPanel = $("<div/>", {
							"class": "col-md-9",
							"id": "rightPanel",
			}).appendTo(containerRow);
			
			var panel = $( "<div/>", {
						"class": "panel panel-primary inline-panel",
						"id": "data-control-panel",
			});
			panel.append("<div class=panel-heading> Data Control Panel</div>");
			var panelBody = $("<div id='leftPanelBody' class=panel-body></div>").appendTo(panel);
			
			leftPanel.append(panel);
			
			initGraph(data);
		}
	});
	
	var buttonsRow = $("#buttonsRow");
	buttonsRow.append(addToCategoriesButton);
	buttonsRow.append(addToMeasuresButton);
	buttonsRow.append(addToTimeFieldButton);
	buttonsRow.append(plotGraphButton);
	
}

function addColumn(columnTable, targetTable) {
	$("tr.highlight > td").each(function(index){
		var columnToAdd = $(this).text();
		$(columnTable).find("td:contains('" + columnToAdd + "')").closest('tr').remove();
		$(targetTable).append("<tr><td>" + columnToAdd + "</td></tr>");
	});
}

function initData() {
	var object = {};
	object.measures = [];
	object.categories = [];
	object.dateField = "";
	
	$("#measuresTable td").not(":first").each(function(index){
		object.measures.push($(this).text());
	});
	$("#categoriesTable td").not(":first").each(function(index){
		object.categories.push($(this).text());
	});
	$("#timeFieldTable td").not(":first").each(function(index){
		object.dateField= $(this).text();
	});
	
	return object;
}