function setData(data) {		
		var categories = d3.keys(data[0]);
		
		var years = d3.set();
		data.forEach(function(d){
			years.add(new Date(d[dateField]).getFullYear());
		});
		years = years.values();
		years.forEach(function(d, i, arr){
			$("<option>" + d + "</option>").appendTo($("#year"));
		});

		$("#year").change(function(){
			updateMonth(data);
		});
	} // function filterData
	
	
	function updateMonth(data) {
		currentYear = parseInt($("#year").find(':selected').text());
		var dataInThatYear = data.filter(function(d){
			return new Date(d[dateField]).getFullYear() == currentYear;
		});
		var months = d3.set();
		dataInThatYear.forEach(function(d){
			months.add(new Date(d[dateField]).getMonth());
		});
		months = months.values();
		$("#month > option").remove();
		months.forEach(function(d, i, arr){
			$("<option>" + formatMonth(new Date(currentYear, d)) + "</option>").appendTo($("#month"));
		});
	}