function e_sports_analysis(){
    var filePath="data.csv";
    question0(filePath);
    scatter_plot(filePath);
    bar_plot(filePath);
    stacked_bar_plot(filePath);
    choropleth(filePath);
    network_graph();
}

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data)
    });
}

var scatter_plot=function(filePath){
    var rowConverter = function(d){
        return {
            KDA:parseFloat(d.KDA),
            Player :d.Player,
            Team: d.Team
        }
			
    }
    d3.csv(filePath,rowConverter).then(data=>{
        // Cleaning the data
        var player_name = []
        for (let i = 0; i < data.length; i++){
            player_name.push(data[i].Player)
        }
        var player_name = Array.from(new Set(player_name))

        // Defining Location of the button
        let data_group = d3.group(data, d=> d.Team)
        current_location = "Cloud9"
        current_data = data_group.get(current_location)

        // set the dimensions and margins of the graph
        var margin = {top: 50, right: 50, bottom: 50, left: 80},
        width = 1200 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg_scatter = d3.select("#scatter_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // xScale and yScale with axis
        var xScale = d3.scaleBand()
            .range([ 0, width])
            .domain(player_name)
            .padding(0.05)

        svg_scatter.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "xaxis")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("font", "6px times")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")

        var yScale = d3.scaleLinear()
            .domain([0.5, d3.max(data, function(d) {return d.KDA})])
            .range([height, 0])
        svg_scatter.append("g")
            .call(d3.axisLeft(yScale))
            .attr("class", "yaxis")
            .selectAll("text")
            .style("font", "6px times")
        padding = 5
        // Adding circles(dots) to the graph
        svg_scatter.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr("cx", function(d) {
                return xScale(d.Player) + xScale.bandwidth() + padding
            })
            .attr("cy", function(d) { 
                return yScale(d.KDA)
            })
            .attr("r", 3)
            .style("fill", "blue")
        var radio = d3.select('#radio_scatter')
            .attr('name', 'region').on("change", function (d) {
                // Resetting the data for the button
                current_location = d.target.value
                current_data = data_group.get(current_location)
                var player_name = []
                for (let i = 0; i < current_data.length; i++){
                    player_name.push(current_data[i].Player)
                }
                var player_name = Array.from(new Set(player_name))

                // Change x and y scale
                var xScale = d3.scaleBand()
                    .range([ 0, width])
                    .domain(player_name)
                    .padding(0.05)
                d3.selectAll('.xaxis')
                    .transition().duration(300)
                    .call(d3.axisBottom(xScale))
                    .selectAll("text")
                    .style("font", "6px times") 
                    .attr("transform", "rotate(-45)")
                    .style("text-anchor", "end")
                
                var yScale = d3.scaleLinear()
                    .domain([0.5, d3.max(current_data, function(d) {return d.KDA})])
                    .range([height, 0])
                d3.selectAll('.yaxis')
                    .transition().duration(300)
                    .call(d3.axisLeft(yScale))

                // Update Circle information
                var circ = svg_scatter.selectAll("circle").data(current_data)
                circ.enter()
                    .append("circle")
                    .merge(circ)
                    .transition()
                    .duration(500)
                    .attr("cx", function(d) {return xScale(d.Player) + xScale.bandwidth()/2})
                    .attr("cy", function(d) { return yScale(d.KDA) })
                    .attr("r", 3)
                    .style("fill", "blue")
                circ.exit().remove()
            
        })  

    })
}

var bar_plot=function(filePath){
    var rowConverter = function(d){
        return {
            ACS:parseFloat(d["ACS/Map"]),
            Maps:parseFloat(d.Maps)
        }
    }
    d3.csv(filePath,rowConverter).then(data=>{
        // Cleaning the data
        data = d3.flatRollup(data, v=>d3.mean(v, d =>d.ACS), d=>d.Maps)
        data = d3.map(data, ([Maps, ACS]) => ({Maps, ACS}))
        var map_name = []
        for (let i = 0; i < data.length; i++){
            map_name.push(data[i].Maps)
        }
        var map_name = Array.from(new Set(map_name))

        // set the dimensions and margins of the graph
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg_bar = d3.select("#bar_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")

        // xScale and yScale with axis
        var xScale = d3.scaleBand()
            .domain(map_name)
            .range([0, width])
        svg_bar.append("g")
            .attr("transform", "translate(0," + (height) + ")")
            .call(d3.axisBottom(xScale))
 
        var yScale = d3.scaleLinear()
            .domain([80, d3.max(data, function(d){ 
                return d.ACS;
            })])
            .range([height, 0])
        svg_bar.append("g")
            .call(d3.axisLeft(yScale));

        // Adding the bars to the graph
        svg_bar.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xScale(d.Maps) + xScale.bandwidth()/7;})
            .attr("height", function(d) { return height - yScale(0); })
            .attr("y", function(d) { return yScale(0); })
            .attr("width", 20)
            .style("fill", "maroon")

        // Animation
        svg_bar.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return yScale(d.ACS); })
            .attr("height", function(d) { return height - yScale(d.ACS); })
            .delay(function(d,i){return(i*100)})

    })
    

}
var stacked_bar_plot=function(filePath){
    var rowConverter = function(d){
        return {
            KDA:parseFloat(d.KDA),
            K:parseFloat(d.K),
            D:parseFloat(d.D),
            A:parseFloat(d.A),
            Team:d.Team
        }
    }
    d3.csv(filePath,rowConverter).then(data=>{
        // Cleaning the data
        var teams = []
        for (let i = 0; i < data.length; i++){
            teams.push(data[i].Team)
        }
        var teams = Array.from(new Set(teams))

        // Stack the data for stacked graph
        stack_data = d3.flatRollup(data, v=>[d3.mean(v, d =>d.K), d3.mean(v, d=>d.D), d3.mean(v, d=>d.A)], d=>d.Team)
        stack_data = d3.map(stack_data, ([Team, [K, D, A]]) => ({Team, K, D, A}))

        keys = ["K", "D", "A"]
        let stackgenerator = d3.stack().keys(keys)
        let stacked = stackgenerator(stack_data)

        // set the dimensions and margins of the graph
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

        // create a tooltip
        var Tooltip = d3.select("#bar_plot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")

        // Color Function
        var colors = function(i){
            arr = ["red", "orange", "yellow"];
            return arr[i];
        }

        // append the svg object to the body of the page
        var svg_stacked_bar = d3.select("#stacked_bar_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")

        // xScale and yScale with axis
        var xScale = d3.scaleBand()
            .domain(d3.range(teams.length))
            .range([0, width])
            .padding(0.05)
        svg_stacked_bar.append("g")
            .call(d3.axisBottom(xScale).tickFormat((d, i) => teams[i]))
            .attr("transform", "translate(0," + (height) + ")")
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("font", "8px times")
            .style("text-anchor", "end")
 
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(stack_data, function(d){ return d.K + d.D + d.A;})])
            .range([height, 0])
        var yScale_2 = d3.scaleLinear()
            .domain([0, d3.max(stack_data, function(d){ return d.K + d.D + d.A;})])
            .range([0, height])
        svg_stacked_bar.append("g")
            .call(d3.axisLeft(yScale))

        // Adding the bars to the graph
        var groups = svg_stacked_bar.selectAll(".gbars")
            .data(stacked).enter().append("g")
            .attr("class", "gbars")
            .attr('fill', function(d,i){return colors(i)});
        console.log(stacked)
    
        var rects = groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d,i) { return xScale(i); })
            .attr("y", function(d) { return yScale(d[1]); })
            .attr("height", function(d) { return yScale_2(d[1]) - yScale_2(d[0]);})
            .attr("width",xScale.bandwidth())
            .on("mouseover", function (e, d) {
                Tooltip.transition().duration(50).style("opacity", 0.9);
                })
            .on("mousemove", function (e, d) {
                Tooltip
                    .html(d[1] + " Kills")
                    .style("top", (e.pageY - 10) + "px")
                    .style("left", (e.pageX + 10) + "px")
                })
            .on("mouseleave", function (e, d) {
                Tooltip
                    .transition()
                    .duration(250)
                    .style("opacity", 0)
            })
        
        // Making Legends
        legend_radius = 5
        svg_stacked_bar.selectAll(".legend_color")
            .data(["K","D","A"])
            .enter()
            .append("circle")
            .attr("class", "legend_color")
            .attr("cx", width * 0.95)
            .attr("cy", (d, i) => height * 0.25 + i * legend_radius * 4)
            .attr("r", legend_radius)
            .attr("fill", (d,i) => arr[i])

        svg_stacked_bar.selectAll(".legend_label")
            .data(["K", "D", "A"])
            .enter()
            .append("text")
            .attr("class", "legend_label")
            .attr("x", width * 0.95 + legend_radius * 2)
            .attr("y", (d, i) => height * 0.25 + i * legend_radius * 5)
            .attr("color", "black")
            .style("font-size", legend_radius * 3)
            .text(d => d)
    })

}
var choropleth=function(filePath){
    var rowConverter = function(d){
        return {
            Country:d.Country,
            K:parseFloat(d.K),
        }
    }
    d3.csv(filePath,rowConverter).then(data=>{
        // Cleaning the data
        width = 1000
        height = 700

        // Defining json and csv file
        const statesmap = d3.json("world.json")
        const spot_info = d3.csv("data_world.csv")

        // Getting the long/lat for Country
        spot_info.then(function (dat){
            lat_long = {}
            dat.forEach(function(d){
                temp_val = d.country
                if (!lat_long[temp_val]){
                    lat_long[temp_val] = [d.longitude, d.latitude]
                }
            })
      
        statesmap.then(function (map) {
        
        // Making the path
        var projection = d3.geoNaturalEarth1()
        var path = d3.geoPath().projection(projection)

        // Cleaning data to create path
        let temp_d = data.filter(function(d){
            return d.Country != 'Czechia' & d.Country != 'Chile' & d.Country != 'Belgium' & d.Country != 'Thailand'& d.Country != 'Denmark' & d.Country != 'Indonesia' & d.Country != 'Malaysia'  & d.Country != 'Singapore' & d.Country != 'Philippines'

        })
        let one = d3.rollup(temp_d, v=>v.length, d=>d.Country)
        let dats = d3.map(one, ([country, num]) => ({ country, num }))


        // const zoom = d3.zoom()
        //     .scaleExtent([1, 8])
        //     .translateExtent([[0, 0], [width, height]])
        //     .on('zoom', zoomed);

        // New SVG
        var svg_choropleth = d3.select("#choropleth_graph")
        .append("svg")
        .attr("width", width)  
        .attr("height", height);


        // New Path
        svg_choropleth.selectAll("path")
            .data(map.features)
            .enter()    
            .append("path")
            .attr("d", path)
            .attr("fill", "#ADD8E6")
            .style("stroke", "black")
            .style("stroke-width", 0.2)

        // Adding circles to show the amount of players
        fill = "#0288d1"
        stroke = "red"
        svg_choropleth.selectAll(".centroid").data(dats)
            .enter().append("circle")
            .attr("cx", function (d){ 
                temp = d.country
                return projection(lat_long[temp])[0]
             })
            .attr("cy", function (d){ 
                temp = d.country
                return projection(lat_long[temp])[1]
             })
            .attr("r", function(d){
                return Math.log(d.num) * 2
            })
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", 0.1)

        
        // Adding and calling zoom
        const zoom = d3.zoom()
            .scaleExtent([1,8])
            .on('zoom', function(event) {
                svg_choropleth.selectAll('path').attr('transform', event.transform)
                svg_choropleth.selectAll('centroid').attr('transform', event.transform)
            })
        svg_choropleth.call(zoom)


        })  
        
    })
    })
}

var network_graph=function(){
    var data = {
        "nodes": [
            { id: 1, name: 'Cloud9', x: 87, y: 145, avg_kda: 1.4, avg_assists: 7.3 },
            { id: 2, name: 'DRX', x: 176, y: 94, avg_kda: 1.538, avg_assists: 8.2 },
            { id: 3, name: 'F4Q', x: 249, y: 162, avg_kda: 1.08, avg_assists: 3.2 },
            { id: 4, name: 'Sentinels', x: 208, y: 253, avg_kda: 1.49, avg_assists: 7.5 },
            { id: 5, name: 'Vision Strikers', x: 105, y: 246, avg_kda: 1.055, avg_assists: 4.1 },
        ],
        "edges": [{
            'source': { id: 1, name: 'Cloud9', x: 87, y: 145 },
            'target': { id: 2, name: 'DRX', x: 176, y: 94 },
            'chem': 70
        },
        {
            'source': { id: 1, name: 'Cloud9', x: 87, y: 145 },
            'target': { id: 3, name: 'F4Q', x: 249, y: 162 },
            'chem': 65
        },
        {
            'source': { id: 1, name: 'Cloud9', x: 87, y: 145 },
            'target': { id: 4, name: 'Sentinels', x: 208, y: 253 },
            'chem': 75
        },
        {
            'source': { id: 1, name: 'Cloud9', x: 87, y: 145 },
            'target': { id: 5, name: 'Vision Strikers', x: 105, y: 246 },
            'chem': 88
        },

        {
            'source': { id: 2, name: 'DRX', x: 176, y: 94 },
            'target': { id: 3, name: 'F4Q', x: 249, y: 162 },
            'chem': 80
        },
        {
            'source': { id: 2, name: 'DRX', x: 176, y: 94 },
            'target': { id: 4, name: 'Sentinels', x: 208, y: 253 },
            'chem': 95
        },
        {
            'source': { id: 2, name: 'DRX', x: 176, y: 94 },
            'target': { id: 5, name: 'Vision Strikers', x: 105, y: 246 },
            'chem': 73
        },

        {
            'source': { id: 3, name: 'F4Q', x: 249, y: 162 },
            'target': { id: 5, name: 'Vision Strikers', x: 105, y: 246 },
            'chem': 88
        },
        ]

    }
    data["links"] = []
    for (var i = 0; i < data.edges.length; i++) {
        var obj = {}
        obj["source"] = data.edges[i]["source"].id - 1
        obj["target"] = data.edges[i]["target"].id - 1
        obj["chem"] = data.edges[i]["chem"]
        data.links.push(obj);
    }
    let radius = 25
    width = 800
    height = 700

    const svg = d3.select("#network_graph")
        .append("svg")
        .attr("width", width - 100)
        .attr("height", height - 100)

    var force = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).distance(d => -d.chem))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => radius * 5))

    var links = svg.selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-width", function(d){
            return (d.chem ** 3 / 1000000) * 10
        })

    var nodes = svg.selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("fill", function(d){
            if (d.name == 'P3' || d.name == 'P5') {
                return "#008b8b"
            }
            return "grey"
        })

    var labels = svg.selectAll("label")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("font-size", 10)
        .style("text-anchor", "middle")
        .text(d => d.name)


    force.on("tick", function () {

        links.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        nodes.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", radius);

        labels.attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })

    });
}
