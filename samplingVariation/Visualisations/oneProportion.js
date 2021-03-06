
function oneProportion(inputData, heading, focus, unique){
	this.radius = 5;
	this.population = [];
	this.populationStatistic = null;
	this.numSamples = 1000;
	this.xScale = null;
	this.samples = [];
	this.preCalculatedTStat = [];
	this.transitionSpeed = 1000;
	this.index = 1;
	this.statsDone = false;
	this.animationState = 0;
	this.baseTransitionSpeed = 1000;
	// this.windowHelper = setUpWindow(this.radius);
	this.windowHelper = setUpWindow3({'left':5, 'right':5, 'top':10, 'bottom':5}, false);
	this.barHeight = 100;
	this.focusGroup = focus;
	this.order = [focus,"Other Groups"];
		this.popSetup = false;
	this.sampSetup = false;
	this.category = heading;
	this.drawnSamples = [];
			this.implemented = true;
			this.unique1 = unique;

	this.changeStat = function(newStatistic){
		this.statistic = newStatistic;
		this.destroy();
	}
	this.setUpPopulation = function(){
		this.sampleSize = 40;
		this.samples.push([]);
		this.drawnSamples = [];
		this.secondaryGroup = null;
		var groups = {};
		
		if(this.unique1.length == 2){
			if(focus != this.unique1[1]){
				this.order[1] = this.unique1[1];
			}else{
				this.order[1] = this.unique1[0];
			}
		}
		for(var j =0;j<this.order.length;j++){
			groups[this.order[j]] = 0;
		}
		for(var i = 0; i<inputData.length;i++){
			var value = inputData[i][heading];
			if(!(value == this.focusGroup)) value = this.order[1];
			if(!(value in groups)) groups[value] = 0;
			groups[value] += 1;
			var addItem = new item(0, i);
			addItem.group = value;
			this.population.push(addItem);
		}
		var total = 0;
		for(var j =0;j<this.order.length;j++){
			this.samples[0].push([total, groups[this.order[j]]]);
			total += groups[this.order[j]];
		}
		this.xScale = d3.scale.linear().range([this.windowHelper.graphSection.x,this.windowHelper.graphSection.width]);
		this.xScale.domain([0,1]);
		this.popSetup = true;
	}

	this.setUpSamples = function(sSize){
		this.sampleSize = d3.select("#sampsize").property("value");
		if(this.sampleSize >= this.population.length){
			alert("Sample size is too large for the poplation");
			return;
		}
		var lastElement = this.samples[0][this.samples[0].length -1];
		this.total = lastElement[0] + lastElement[1];
		this.populationStatistic = 0;
		this.populationStatistic =	this.xScale(lastElement[0]/ (lastElement[1]+lastElement[0]));
		this.samples = this.samples.concat(this.makeSamples(this.population, this.numSamples, this.sampleSize));
		for(var k = 0; k < this.numSamples;k++){
			lastElement = this.samples[k+1][this.samples[0].length -1];
			var stat = lastElement[0]/ (lastElement[1]+lastElement[0]);
			this.preCalculatedTStat.push(new item(stat, k));
		}
		heapYValues3(this.preCalculatedTStat, this.xScale, this.windowHelper.graphSection.x, 0, this.windowHelper.graphSection.S3.y,this.windowHelper.graphSection.S3.getDivisions(1)[0][0]);

		this.statsDone = true;
		this.sampSetup = true;
	}




	this.makeSamples = function(population, numSamples, sampleSize){
	var samples = [];
	for(var i = 0; i<numSamples;i++){
		var groups = {};
		for(var j =0;j<this.order.length;j++){
			groups[this.order[j]] = 0;
		}
		samples.push([]);
		var indexs = pickRand(sampleSize, population.length);
		for(var k = 0; k<sampleSize;k++){
			var value = population[indexs[k]]["group"];
			if(!(value in groups)) groups[value] = 0;
			groups[value] += 1;
		}
		var total = 0;
		for(var key in groups){
			samples[i].push([total, groups[key]]);
			total += groups[key];
		}
		if(samples[i].length == 1){
			samples[i].push([total, 0]);
		}
	}
	return samples;
	}


	this.draw = function(){
		this.drawPop();
		this.drawSamples();

	}
	this.drawSamples = function(){
		if(!this.sampSetup) return;
				var self = this;
		var svg = d3.select(".svg");
		/*var meanLines = svg.select(".sampleLines").selectAll("line").data(this.preCalculatedTStat)
			.enter().append("line").attr("y1", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]+20).attr("y2", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]-20).attr("x1", function(d){return self.xScale(d.value)}).attr("x2", function(d){return self.xScale(d.value)}).style("stroke-width", 2).style("stroke", "green").style("opacity", 0);
	*/
		var meanCircles = svg.select(".meanOfSamples").selectAll("circle").data(this.preCalculatedTStat)
			.enter().append("circle")
			    .attr("cx", function(d, i) { 
			    	return d.xPerSample[0]; })
			    .attr("cy", function(d) {
			    	return d.yPerSample[0] - (self.windowHelper.graphSection.S3.getDivisions(1)[0][0]- self.windowHelper.graphSection.S2.getDivisions(1)[0][0]);
			    })
			    .attr("r", function(d) { return self.radius; })
			    .attr("fill-opacity", 0)
			    .attr("stroke","#556270")
			    .attr("stroke-opacity",0);
	}
	this.drawPop = function(){
		if(!this.popSetup) return;
		var self = this;
		//if(!this.statsDone) return;
		var svg = d3.select(".svg");
		svg.append("text").text("what");
		var sampleSelection = svg.append("svg").attr("class","sampleSelection");
		sampleSelection.append("svg").attr("class","g1Circles");
		sampleSelection.append("svg").attr("class","g2Circles");
		var xAxis = d3.svg.axis();
		xAxis.scale(this.xScale)
		svg.append("g").attr("class","axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S1.getDivisions(1)[0][0] + this.radius) + ")").call(xAxis);
		svg.append("g").attr("class","axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S2.getDivisions(1)[0][0] + this.radius) + ")").call(xAxis);
		svg.append("g").attr("class","axis").attr("transform", "translate(0," + (this.windowHelper.graphSection.S3.getDivisions(1)[0][0] + this.radius) + ")").call(xAxis);
		svg.append("text").attr("class","sectionLabel").attr("y",this.windowHelper.graphSection.S1.y + 15).text("Population").style("opacity", 1).style("font-size",15).style("fill","black").style("font-weight","bold");
		svg.append("text").attr("class","sectionLabel").attr("y",this.windowHelper.graphSection.S2.y + 15*2.5).text("Sample").style("opacity", 1).style("font-size",15).style("fill","black").style("font-weight","bold");
		svg.append("text").attr("class","sectionLabel").attr("y",this.windowHelper.graphSection.S3.y + 15*2.5).text("Sampling Distribution").style("opacity", 1).style("font-size",15).style("fill","black").style("font-weight","bold");
		var lastElement = this.samples[0][this.samples[0].length -1];
		var total = lastElement[0] + lastElement[1];
		//this.xScale.domain([0,total]);
		var gridHeight = (this.barHeight - this.radius*0)/(this.radius*2);
		var gridWidths = [Math.floor((this.xScale((this.samples[0][0][1])/total))/(this.radius*2)-1),Math.floor(this.xScale((this.samples[0][1][1])/total)/(this.radius*2)-1)];

		svg.append("svg").attr("class", "pop");
		
		var g1Rect = svg.select(".pop").selectAll("g").data(this.samples[0]);
		var groups = g1Rect.enter().append("g").attr("id",function(d,i){return "popRect"+i});
		this.groupCircles = [[],[], gridHeight];
		for(var h = 0;h<2;h++){
			var num = this.samples[0][h][1];
			var numCols = Math.ceil(num/gridHeight);
			var margin = ((Math.floor((this.xScale((this.samples[0][h][1])/total))) - numCols*this.radius*2)-this.windowHelper.graphSection.x)/(numCols);
			this.groupCircles[h] = [num,numCols,margin];
			for(var j =0;j<gridWidths[h];j++){
				if(k*j > this.samples[0][h][1]) continue;
				for(var k = 0; k< gridHeight;k++){
					if(gridHeight*(j) + k +1 > this.samples[0][h][1]) continue;
					d3.select("#popRect"+h).append("circle").attr("cy",this.windowHelper.graphSection.S1.getDivisions(1)[0][0] - this.barHeight +(k*this.radius*2) + this.radius).attr("cx", self.xScale(this.samples[0][h][0]/total)+this.radius +(j*this.radius*2 +j*margin)).attr("r",this.radius).attr("fill-opacity",0).attr("stroke-opacity",0.5);
				}
			}
		}
		var fontSize = this.windowHelper.graphSection.S1.height /9;
		groups.append("rect")
			.attr("height",this.barHeight)
			.attr("y",this.windowHelper.graphSection.S1.getDivisions(1)[0][0] - this.barHeight)
			.attr("width", function(d){return self.xScale(d[1]/total) - self.windowHelper.graphSection.x})
			.attr("x",function(d){return self.xScale(d[0]/total)})
			.attr("fill",function(d,i){return colorByIndex[i]})
			.attr("fill-opacity","0.5");

		groups.append("text")
			.attr("x", function(d){return self.xScale((d[0] +(d[1]/2))/total)})
			.attr("y", this.windowHelper.graphSection.S1.getDivisions(1)[0][0] - this.barHeight/6)
			.text(function(d){return d[1]})
			.attr("fill",function(d,i){return /*colorByIndex[i]*/ "white"})
			.style("font-size", this.barHeight+"px")
			.attr("text-anchor","middle").style("opacity",0.6);
		groups.append("text")
			.attr("x", function(d){return self.xScale((d[0] +(d[1]/2))/total)})
			.attr("y", this.windowHelper.graphSection.S1.getDivisions(1)[0][0] - this.barHeight - fontSize*0)
			.text(function(d, i){return self.order[i]})
			.attr("fill",function(d,i){return colorByIndex[i]})
			.style("font-size",fontSize+"px")
			.attr("text-anchor","middle").style("opacity",0.6).style("stroke","black");


		/*var circle = svg.selectAll("circle").data(this.population);
		   circle.enter().append("circle")
		    .attr("cx", function(d, i) { 
		    	return d.xPerSample[0]; })
		    .attr("cy", function(d) {
		    	return d.yPerSample[0];
		    })
		    .attr("r", function(d) { return self.radius; })
		    .attr("fill-opacity", 0.5)
		    .attr("stroke","#556270")
		    .attr("stroke-opacity",1); 
	*/


		svg.append("line").attr("x1", this.populationStatistic).attr("y1", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]+20).attr("x2", this.populationStatistic).attr("y2", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]-20).style("stroke-width", 2).style("stroke", "black");
	
	}
	this.startAnim = function(repititions, goSlow, incDist){
				this.incDist = incDist;
		var self = this;
		if(repititions >999) this.resetLines();
		if(this.animationState == 0){
			this.transitionSpeed = this.baseTransitionSpeed-repititions*20;
			//this.animationState = 1;
			if(this.index > this.numSamples){
				this.index = this.index % this.numSamples;
				this.resetLines();
			}
			var start = this.index;
			var end = start + repititions;
			if(repititions > 100) this.transitionSpeed = 50;
			var jumps = 1;
			if(repititions > 20) 
			{
				jumps = 2;
				if(incDist) jumps = 10;
			}
			if(repititions == 1) this.transitionSpeed = 1000;
			if(repititions == 5) this.transitionSpeed = 500;
			if(repititions == 20) this.transitionSpeed = 100;
			if(repititions == 1000) this.transitionSpeed = 0;
			var settings = new Object();
			settings.goSlow = goSlow;
			settings.indexUpTo = start;
			settings.incDist = incDist;
			settings.end = end;
			settings.jumps = jumps;
			settings.delay = 1000;
			settings.pauseDelay = 1000;
			settings.fadeIn = 200;
			settings.repititions = repititions;
			this.fadeIn(settings);
			//self.stepAnim(start, end, goSlow, jumps);
		}
	}

		this.fadeIn = function(settings){
			if(this.animationState == -1) return;
			if(this.animationState == 1) return;
			this.animationState = 1;
			this.settings = settings;
			if(!this.settings.restarting){
				var sentFinish = false;

				var self = this;
				settings.sample = this.samples[settings.indexUpTo];
				settings.svg = d3.select(".svg");
				this.settings = settings;
				if(settings.goSlow)settings.svg.select(".sampleLines").selectAll("g").remove();
				//var circle = settings.svg.selectAll(".g1Circles, .g2Circles").selectAll("circle").attr("cy", function(d, i){return d.yPerSample[0];}).style("fill", "#C7D0D5").attr("fill-opacity",0.2);
				settings.svg.select(".sampleLines").selectAll("line").style("stroke", "steelblue").style("opacity",0.5).attr("y2",this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight/2 );
				var powScale = d3.scale.pow();
				powScale.exponent(4);
				powScale.domain([0,settings.delay*2]);
				var pop = this.samples[0];
				var randSelection = [];
				for(var i =0; i< settings.sample.length;i++){
					randSelection.push([]);
					for(var k = 0; k< settings.sample[i][1];k++){
						var posData = this.groupCircles[i];
						var margin = posData[2];
						cY = Math.round(Math.random()*(this.groupCircles[2]-1)) + 1;
						cX = Math.round(Math.random()*(posData[1]-1));
						if(cX == posData[1]-1){
							cY = posData[0]%this.groupCircles[2];
						}
						var scale = i;
						randSelection[i].push([this.windowHelper.graphSection.x +(cX*this.radius*2 +cX*margin), -(cY*this.radius*2) + this.radius + this.barHeight, scale, i]);
					}
				}
				var allInSample = randSelection[0].concat(randSelection[1]);
				shuffle(allInSample);
				var g1Circles = settings.svg.select(".g1Circles").selectAll("circle").data(randSelection[0], function(d){return d});
				g1Circles.exit().remove();
				g1Circles.enter().append("circle");
				g1Circles.attr("cx",function(d){
					return self.xScale(self.samples[0][0][0]/self.total) + d[0]}).attr("cy",function(d){return self.windowHelper.graphSection.S1.getDivisions(1)[0][0] - d[1]}).attr("r",self.radius).style("fill",colorByIndex[0]).attr("fill-opacity",0).attr("stroke-opacity",0);

				var g2Circles = settings.svg.select(".g2Circles").selectAll("circle").data(randSelection[1], function(d){return d});
				g2Circles.exit().remove();
				g2Circles.enter().append("circle");
				g2Circles.attr("cx",function(d){return self.xScale(self.samples[0][1][0]/self.total) + d[0]}).attr("cy",function(d){return self.windowHelper.graphSection.S1.getDivisions(1)[0][0] - d[1]}).attr("r","5").style("fill",colorByIndex[1]).attr("fill-opacity",0).attr("stroke-opacity",0);

			var lastElement = settings.sample[1];
			var sampleTotal = lastElement[0] + lastElement[1];
			settings.sampleTotal = sampleTotal;
			var stat = lastElement[0]/sampleTotal;
			settings.stat = stat;
				var g1Scale = d3.scale.linear().range([this.windowHelper.graphSection.x,this.windowHelper.graphSection.width*stat]).domain([0,pop[0][1]/this.total]);
				var g2Scale = d3.scale.linear().range([this.windowHelper.graphSection.width*stat,this.windowHelper.graphSection.width]).domain([pop[1][0]/this.total,1]);
				var scales = [g1Scale,g2Scale];
				settings.scales = scales;
				this.settings.scales = scales;
			    var fillInTime = this.transitionSpeed/this.baseTransitionSpeed;
			    this.settings.circleOverlay = circleOverlay;
			    this.settings.powScale = powScale;
			    this.settings.allInSample = allInSample;
			}else{
				var circleOverlay = this.settings.circleOverlay;
				var powScale = this.settings.powScale;
				var self = this;
			    var fillInTime = this.transitionSpeed/this.baseTransitionSpeed;
			    var allInSample = this.settings.allInSample;
			    var scales = this.settings.scales;
			    this.settings.restarting = false;
			}
			var sampleSelection = settings.svg.select(".sampleSelection").selectAll("circle");
			if(settings.goSlow){
				sampleSelection = sampleSelection.transition().delay(function(d,i){return settings.delay*2/allInSample.length * allInSample.indexOf(d)}).duration(100).attr("fill-opacity", 1)
				.transition().duration(function(d,i){return settings.delay*2/allInSample.length * (allInSample.length - allInSample.indexOf(d))})
				.transition().duration(settings.pauseDelay)
				.transition().duration(this.transitionSpeed).attr("cy",function(d){return self.windowHelper.graphSection.S2.getDivisions(1)[0][0] -self.barHeight/2- d[1]}).attr("cx",function(d){
					return self.xScale(settings.sample[d[3]][0]/self.sampleSize) + d[0]/((self.xScale((self.samples[0][0][0] + self.samples[0][d[3]][1])/self.total)) / self.xScale((settings.sample[0][0] + settings.sample[d[3]][1])/self.sampleSize))}).each("end", function(d, i){
						var test = i;
						if(i==0){
							self.makeRects(settings);
						}
					});
			}else{
				sampleSelection = sampleSelection.attr("fill-opacity", 1).transition().duration(0).each("end", function(d,i){
					if(i==0){
						self.makeRects(settings);
					}
					});
			}
	}

	this.makeRects = function(settings){
			if(this.animationState == -1 || this.animationState == 0) return;
			if(this.animationState == 2) return;
			this.animationState = 2;
			var self = this;
			var svg = settings.svg;
			if(!this.settings.restarting){
				var sampleRect = svg.select(".sampleLines").selectAll("g").data(settings.sample, function(d){return d});
				sampleRect.exit().remove();
				var groups = sampleRect.enter().append("g");
				groups.append("rect")
				.attr("height",this.barHeight)
				.attr("y",this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight*1.5)
				.attr("width", function(d){return self.xScale(d[1]/settings.sampleTotal) - self.windowHelper.graphSection.x})
				.attr("x",function(d){return self.xScale(d[0]/settings.sampleTotal)})
				.attr("fill",function(d,i){return colorByIndex[i]})
				.style("opacity",0);
				groups.append("text")
				.attr("x", function(d){return self.xScale((d[0] +(d[1]/2))/settings.sampleTotal)})
				.attr("y", this.windowHelper.graphSection.S2.getDivisions(1)[0][0] -this.barHeight/2 - this.barHeight/10)
				.text(function(d){return d[1]})
				.attr("fill",function(d,i){return /*colorByIndex[i].brighter([20])*/ "white"})
				.style("font-size",this.barHeight)
				.attr("text-anchor","middle")
				.style("opacity",0);

				this.drawnSamples.push(settings.stat);
				var meanLines = svg.select(".sampleLines").selectAll("line").data(this.drawnSamples);
				//meanLines.exit().remove();
				//meanLines.style("opacity",0.5).attr("y2",this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight/2 );
				meanLines.enter().append("line").attr("x1", this.xScale(settings.stat)).attr("y1", this.windowHelper.graphSection.S2.getDivisions(1)[0][0]).attr("x2", this.xScale(settings.stat)).attr("y2", this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight/2-20).style("stroke-width", 2).style("stroke", "black").style("opacity",0);
			
				this.settings.groups = groups;
				this.settings.meanLines = meanLines;
				this.settings.sampleRect = sampleRect;
			}else{
				var groups = this.settings.groups;
				var meanLines = this.settings.meanLines;
				var sampleRect = this.settings.sampleRect;
							    this.settings.restarting = false;
			}
			if(settings.goSlow){
			sampleRect.selectAll("*").transition().duration(this.transitionSpeed).style("opacity",0.5);
			meanLines.transition().duration(this.transitionSpeed).style("opacity",1).transition().duration(this.transitionSpeed*2).each("end", function(d, i){
				//if(d == self.drawnSamples[self.drawnSamples.length-1]){
				if(i==0){
					if(settings.incDist){
							self.distDrop(settings);
					}else{
						self.animStepper(settings);
					}
				}

					});
			}else{
				sampleRect.selectAll("*").style("opacity",0.5);
				meanLines.style("opacity",0.5).transition().duration(this.transitionSpeed*2).each("end", function(d,i){
				if(i ==0){
				//if(d == self.drawnSamples[self.drawnSamples.length-1]){
					if(settings.incDist){
							self.distDrop(settings);
					}else{
						self.animStepper(settings);
					}
				}

						}
						);

			}

	}

	this.distDrop = function(settings){

		if(this.animationState == -1 || this.animationState == 0) return;
		if(this.animationState == 3) return;
			this.animationState = 3;
		var self = this;

		var downTo = this.preCalculatedTStat[settings.indexUpTo -1].yPerSample[0];
		if(!this.settings.restarting){
			d3.select("#redLine").remove();
			var redLine = settings.svg.select(".meanOfSamples").append("line").attr("id","redLine").attr("y1", this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight/2-20).attr("y2", this.windowHelper.graphSection.S2.getDivisions(1)[0][0]).attr("x1",this.preCalculatedTStat[settings.indexUpTo-1].xPerSample[0]).attr("x2",this.preCalculatedTStat[settings.indexUpTo-1].xPerSample[0]).style("stroke-width", 2).style("stroke", "red").style("opacity", 0);

			var meanCircles = settings.svg.select(".meanOfSamples").selectAll("circle").filter(function(d, i){
					return (i>=settings.indexUpTo -1) && (i <settings.indexUpTo+settings.jumps -1 );
				});
			this.settings.redLine = redLine;
			this.settings.meanCircles = meanCircles;
		}else{
			//var redLine = this.settings.redLine;
			var redLine = d3.select("#redLine");
			var meanCircles = this.settings.meanCircles;
			this.settings.restarting = false;
		}
		if(this.transitionSpeed > 200){
			redLine.style("opacity",1).transition().duration(this.transitionSpeed*2).attr("y1", downTo).attr("y2", downTo).each("end",function(){d3.select(this).remove()});
		}
		if(settings.goSlow){
			meanCircles = meanCircles.attr("cy", function(d){return d.yPerSample[0] -(self.windowHelper.graphSection.S3.getDivisions(1)[0][0]-d.yPerSample[0])}).transition().delay(this.transitionSpeed *1.8).attr("fill-opacity",(this.transitionSpeed * 0.001)).attr("stroke-opacity",(this.transitionSpeed * 0.001)).style("fill","#FF0000").attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").style("fill","#C7D0D5")
			.each('end', function(d, i){ if(i == 0){self.animStepper(settings)}});
		}else{
			if(this.transitionSpeed > 100){
			meanCircles = meanCircles.attr("cy", function(d){return d.yPerSample[0] -(self.windowHelper.graphSection.S3.getDivisions(1)[0][0]- d.yPerSample[0])}).transition().delay(this.transitionSpeed*1.7).duration(100).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").transition().duration(this.transitionSpeed)
			.each('end', function(d, i){ if(i ==0){self.animStepper(settings);}});
			}else{
					meanCircles = meanCircles.attr("cy", function(d){if(self.transitionSpeed>10){return d.yPerSample[0] -(self.windowHelper.graphSection.S3.getDivisions(1)[0][0]- d.yPerSample[0])}else{return d.yPerSample[0]}}).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").transition().duration(this.transitionSpeed)
			.each('end', function(d, i){ if(i ==0){self.animStepper(settings);}});
			}
		}
		
	}

		this.animStepper = function(settings){
		if(this.animationState == 4) return;
		this.animationState = 4;
		settings.indexUpTo += settings.jumps;
		this.index += settings.jumps;
		if(settings.indexUpTo >= settings.end  || settings.indexUpTo>= this.numSamples){
			mainControl.doneVis();
			this.animationState = 0;
			return;
		}
		this.fadeIn(settings);

	}

		this.pause = function(){

		var rL = d3.select("#redLine");
		if(rL[0][0] != null) {this.settings.redLine = [rL.attr("y1"), rL.attr("y2"), rL.attr("x1")]; 
		//rL.remove();
	}
		d3.select(".svg").selectAll("*").transition().duration(20).attr("stop","true");
		this.pauseState = this.animationState;
		this.animationState = 0;
		d3.selectAll(".goButton").attr("disabled",true);
		this.settings.restarting = false;
	}
	this.unPause = function(){
		//this.resetLines();
		//d3.select(".svg").selectAll("*").transition().duration(20).attr("stop","true");
		//this.animationState = this.pauseState;
		this.settings.restarting = true;
		if(this.pauseState == 1){
			this.fadeIn(this.settings);
		}
		if(this.pauseState == 2){
			this.animationState = 1;
			this.makeRects(this.settings);
		}
		if(this.pauseState == 3){
			this.animationState = 2;
			this.distDrop(this.settings);
		}

				//this.animationState = 0;
	}
	this.stepAnim = function(indexUpTo, goUpTo, goSlow, jumps){
		var svg = d3.select(".svg");
		var self = this;
		if(this.animationState != 1){
			return;
		}
		if(indexUpTo < goUpTo){
			if(indexUpTo >= this.numSamples){
				this.animationState = 0;
				return
			}
			var circle = svg.selectAll("circle");
			var sample = this.samples[indexUpTo+1];
			var delay = 1;
			if(goSlow){
				delay = 1000;
			}else{
				delay = 10;
			}
			var lastElement = sample[1];
			var sampleTotal = lastElement[0] + lastElement[1];
			//this.xScale.domain([0,total]);
			var pop = this.samples[0];
			var cY = 0;
			var cX = 0;
			var pauseDelay = 1000;
			if(goSlow){
				pauseDelay = 1000;
			}else{
				pauseDelay = 10;
			}

				var randSelection = [];
				for(var i =0; i< sample.length;i++){
					randSelection.push([]);
					for(var k = 0; k< sample[i][1];k++){
						cY = Math.random()*(100-(this.radius*2)) + this.radius;
						cX = Math.random()*(pop[i][1] - (this.radius*2)) + pop[i][0] + this.windowHelper.graphSection.x;
						var scale = i;
						randSelection[i].push([cX,cY, scale]);
					}
				}
				var allInSample = randSelection[0].concat(randSelection[1]);
				shuffle(allInSample);
				var g1Circles = svg.select(".g1Circles").selectAll("circle").data(randSelection[0], function(d){return d});
				g1Circles.exit().remove();
				g1Circles.enter().append("circle");
				g1Circles.attr("cx",function(d){return self.xScale(d[0]/self.total)}).attr("cy",function(d){return self.windowHelper.graphSection.S1.getDivisions(1)[0][0] - d[1]}).attr("r",self.radius).style("fill",colorByIndex[0]).attr("fill-opacity",0).attr("stroke-opacity",0);

				var g2Circles = svg.select(".g2Circles").selectAll("circle").data(randSelection[1], function(d){return d});
				g2Circles.exit().remove();
				g2Circles.enter().append("circle");
				g2Circles.attr("cx",function(d){return self.xScale(d[0]/self.total)}).attr("cy",function(d){return self.windowHelper.graphSection.S1.getDivisions(1)[0][0] - d[1]}).attr("r","5").style("fill",colorByIndex[1]).attr("fill-opacity",0).attr("stroke-opacity",0);




			var sampleRect = svg.select(".sampleLines").selectAll("g").data(sample, function(d){return d});
			sampleRect.exit().remove();
			var groups = sampleRect.enter().append("g");
			groups.append("rect")
			.attr("height","100")
			.attr("y",this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - 100)
			.attr("width", function(d){return self.xScale(d[1]/sampleTotal) - self.windowHelper.graphSection.x})
			.attr("x",function(d){return self.xScale(d[0]/sampleTotal)})
			.attr("fill",function(d,i){return colorByIndex[i]})
			.style("opacity",0);
			groups.append("text")
			.attr("x", function(d){return self.xScale((d[0] +(d[1]/2))/sampleTotal)})
			.attr("y", this.windowHelper.graphSection.S2.getDivisions(1)[0][0] - this.barHeight)
			.text(function(d){return d[1]})
			.attr("fill",function(d,i){return colorByIndex[i]})
			.style("font-size","32px")
			.attr("text-anchor","middle")
			.style("opacity",0);

			var stat = lastElement[0]/sampleTotal;
			var g1Scale = d3.scale.linear().range([this.windowHelper.graphSection.x,this.windowHelper.graphSection.width*stat]).domain([0,pop[0][1]/this.total]);
			var g2Scale = d3.scale.linear().range([this.windowHelper.graphSection.width*stat,this.windowHelper.graphSection.width]).domain([pop[1][0]/this.total,1]);
			var scales = [g1Scale,g2Scale];
			var meanLines = svg.select(".sampleLines").selectAll("line").data(sample);
			meanLines.exit().remove();
			meanLines.enter().append("line");
			meanLines.attr("x1", this.xScale(stat)).attr("y1", this.windowHelper.graphSection.S2.getDivisions(1)[0][0]+20).attr("x2", this.xScale(stat)).attr("y2", this.windowHelper.graphSection.S2.getDivisions(1)[0][0]-20).style("stroke-width", 2).style("stroke", "black").style("opacity",0);

			var meanCircles = svg.select(".meanOfSamples").selectAll("circle").filter(function(d, i){
				return (i>=indexUpTo) && (i <indexUpTo+jumps);
			});

			var sampleSelection = svg.select(".sampleSelection").selectAll("circle");
			if(goSlow){
				sampleSelection = sampleSelection.transition().delay(function(d,i){return delay*2/allInSample.length * allInSample.indexOf(d)}).duration(100).attr("fill-opacity", 1)
				.transition().duration(function(d,i){return delay*2/allInSample.length * (allInSample.length - allInSample.indexOf(d))})
				.transition().duration(pauseDelay)
				.transition().duration(this.transitionSpeed).attr("cy",function(d){return self.windowHelper.graphSection.S2.getDivisions(1)[0][0] - d[1]}).attr("cx",function(d){
					return scales[d[2]](d[0]/self.total)});
			}else{
				sampleSelection = sampleSelection.attr("fill-opacity", 1);
			}

			if(goSlow){
			sampleRect.selectAll("*").transition().duration(this.transitionSpeed).delay(delay*2 + pauseDelay).style("opacity",0.5);
			meanLines.transition().delay(delay*2 + pauseDelay).duration(this.transitionSpeed).style("opacity",0.5);
			}else{
				sampleRect.selectAll("*").style("opacity",0.5);
				meanLines.transition().style("opacity",0.5);
			}

			if(this.transitionSpeed <= 100){
				meanCircles =meanCircles.attr("cy", function(d){return d.yPerSample[0]}).style("fill","red").transition().duration(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").style("fill","#C7D0D5").each('end', function(d, i){ if(i == 0){self.stepAnim(indexUpTo+jumps, goUpTo, goSlow, jumps)}});
			}else{
				if(goSlow){
					meanCircles = meanCircles.transition().delay(delay*2 + pauseDelay*2 +  this.transitionSpeed).attr("fill-opacity",(this.transitionSpeed * 0.001)).attr("stroke-opacity",(this.transitionSpeed * 0.001)).style("fill","#FF0000")
					.transition().duration(this.transitionSpeed).attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").attr("cy", function(d){return d.yPerSample[0]}).style("fill","#C7D0D5").each('end', function(d, i){ if(i == 0){self.stepAnim(indexUpTo+jumps, goUpTo, goSlow, jumps)}});
				}else{
					meanCircles = meanCircles.attr("fill-opacity",1).attr("stroke-opacity",1).style("stroke", "steelblue").transition().delay(this.transitionSpeed).duration(this.transitionSpeed).attr("cy", function(d){return d.yPerSample[0]}).each('end', function(d, i){ if(i ==0){self.stepAnim(indexUpTo+jumps, goUpTo, goSlow, jumps)}});
				}
			}






			this.index += jumps;


		}else{
			this.animationState = 0;

		}
	}

	this.resetLines =function(){
						d3.select(".svg").selectAll("*").transition().duration(20).attr("stop","true");
		this.index = 1;
		this.drawnSamples = [];
		var self = this;
		var svg = d3.select(".svg");
		svg.select(".sampleLines").selectAll("*").remove();
		svg.select(".g1Circles").selectAll("circle").remove();
		svg.select(".g2Circles").selectAll("circle").remove();
		var meanLines = svg.select(".sampleLines").selectAll("line").attr("y1", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]+20).attr("y2", this.windowHelper.graphSection.S1.getDivisions(1)[0][0]-20).attr("x1", function(d){return self.xScale(d.value)}).attr("x2", function(d){return self.xScale(d.value)}).style("stroke-width", 2).style("stroke", "green").style("opacity", 0);

		var meanCircles = svg.select(".meanOfSamples").selectAll("circle")
		    .attr("cx", function(d, i) { 
		    	return d.xPerSample[0]; })
		    .attr("cy", function(d) {
		    	return d.yPerSample[0] - (self.windowHelper.graphSection.S3.getDivisions(1)[0][0]- self.windowHelper.graphSection.S2.getDivisions(1)[0][0]);
		    })
		    .attr("fill-opacity", 0)
		    .attr("stroke-opacity",0); 

		    this.animationState = 0;
	}




	this.stop = function(){
	this.animationState = -1;
	this.resetLines();
	this.animationState = 0;
	}
	this.destroy = function(){
		d3.select(".svg").selectAll("*").remove();
		d3.select(".svg").append("svg").attr("class","sampleLines");
		d3.select(".svg").append("svg").attr("class","meanOfSamples");
		this.resetData();
		//loadMain();
	}

	this.resetData = function(){
		this.animationState = 0;
		windowHelpers = null;
		this.radius = 5;
		this.population = [];
		this.populationStatistic = null;
		this.samples = [];
		this.preCalculatedTStat = [];		
		this.transitionSpeed = 1000;
		this.index = 1;
		this.statsDone = false;

		this.baseTransitionSpeed = 1000;
	}
}