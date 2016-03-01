var nGraph = {

    create: function (gridData) {

        var grid = d3.range(10).map(function (i) { return {'x1':0, 'y1':0, 'x2':0, 'y2': 0}; });

        var xTickVals = []
          , tickScaleFactor = 1
          , domainMax = gridData.xMax + 1;
        
        // 100 - 1000
        if (gridData.xMax > 100 && gridData.xMax <= 1000) {
            tickScaleFactor = 100;
            domainMax = gridData.xMax + tickScaleFactor;
            for (var i = tickScaleFactor; i <= domainMax; i += tickScaleFactor) {
                xTickVals.push(i);
            }
        }
        // 10 - 100
        else if (gridData.xMax > 10 && gridData.xMax <= 100) {
            tickScaleFactor = 10;
            domainMax = gridData.xMax + tickScaleFactor;
            for (var i = tickScaleFactor; i <= domainMax; i += tickScaleFactor) {
                xTickVals.push(i);
            }
        }
        // <= 10
        else if (gridData.xMax <= 10) {
            tickScaleFactor = 1;
            domainMax = gridData.xMax + tickScaleFactor;
            for (var i = tickScaleFactor; i <= domainMax; i += tickScaleFactor) {
                xTickVals.push(i);
            }
        } 
        else {
            xTickVals = [];
        }

        var HEIGHT = 0;

        gridData.categories.forEach(function (item) {
            HEIGHT += 50;
        });

        var xscale = d3.scale.linear()
                        .domain([gridData.xMin, domainMax])
                        .range([0, gridData.width - 200]);

        var yscale = d3.scale.linear()
                        .domain([0, gridData.categories.length])
                        .range([0, HEIGHT - 20]); // Leave some vertical room for the bottom-most bar to be above x-axis

        var colorScale = d3.scale.quantize()
                        .domain([0, gridData.categories.length])
                        .range(gridData.colors);

        var canvas = d3.select(gridData.selector)
                        .append('svg')
                        .attr({'width': gridData.width, 'height': HEIGHT + 20}); // Need extra space on the width

        var grids = canvas.append('g')
                          .attr('id', 'grid')
                          .attr('transform', 'translate(150, 10)')
                          .selectAll('line')
                          .data(grid)
                          .enter()
                          .append('line')
                          .attr({
                            'x1': function (d, i) { return i * 30; },
                            'y1': function (d) { return d.y1; },
                            'x2': function (d, i) { return i * 30; },
                            'y2': function (d) { return d.y2; },
                          })
                          .style({'stroke': '#adadad', 'stroke-width': '1px'});

        var xAxis = d3.svg.axis();
            xAxis
                .orient('bottom')
                .scale(xscale)
                .tickSize(1)
                .tickFormat(function (d, i) {
                    return parseInt(((i + 1) * tickScaleFactor), 10); 
                })
                .tickValues(xTickVals);

        var yAxis = d3.svg.axis();
            yAxis
                .orient('left')
                .scale(yscale)
                .tickSize(0)
                .tickFormat(function (d, i) { return gridData.categories[i]; })
                .tickValues(d3.range(gridData.categories.length))
                .tickPadding(20);

        var y_xis = canvas.append('g')
                          .attr("transform", "translate(150,30)")
                          .attr('id','yaxis')
                          .call(yAxis);

        var x_xis = canvas.append('g')
                          // .attr("transform", "translate(150,480)")
                          .attr("transform", "translate(150," + HEIGHT + ")")
                          .attr('id', 'xaxis')
                          .call(xAxis);

        var barWidth = 20;
        var chart = canvas.append('g')
                            .attr("transform", "translate(150,0)")
                            .attr('id', 'bars')
                            .selectAll('rect')
                            .data(gridData.values)
                            .enter()
                            .append('rect')
                            .attr('height', barWidth) // Thickness of bars
                            .attr({'x': 0, 'y': function (d, i) {
                                var ys = yscale(i);
                                console.log('YS: ', ys);
                                return ys + barWidth; // Bar vertical orientation
                            }})
                            .style('fill',function (d, i) { return colorScale(i); })
                            .attr('width',function (d) { return 0; });

        var transit = d3.select("svg").selectAll("rect")
                            .data(gridData.values)
                            .transition()
                            .duration(1000) 
                            .attr("width", function (d) { return xscale(d); });

        var transitext = d3.select('#bars')
                            .selectAll('text')
                            .data(gridData.values)
                            .enter()
                            .append('text')
                            .attr({
                                'x': function (d) { return xscale(d) - 20; }, 
                                'y': function (d, i) { return yscale(i) + 35; }
                            })
                            .text(function (d) { 
                                return d; 
                            })
                            .style({'fill':'#fff','font-size':'14px'});
    }
};