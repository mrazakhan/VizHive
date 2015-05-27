
var width = 1200,
    height = 1280,
    innerRadius = 20,
    outerRadius = 300,
    majorAngle = 2 * Math.PI / 3,
    minorAngle = 1 * Math.PI / 12;


var angle = d3.scale.ordinal()//.domain(d3.range(14)).rangePoints([0, 2 * Math.PI])
    .domain(["1999", "2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012"])
    .rangePoints([0, 1.9 * Math.PI]);
	//.range([0, majorAngle - minorAngle]);
	
var radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);


var svgLegend = d3.select("body").append("div")
    .attr("id", "legend")
    .attr("style", "float:left")
    .attr("height", height)
    .attr("width", "350")
    .append("svg").attr("width", 350).attr("height", height)
/*
var svg = d3.select("body").append("div")
    .attr("id", "visualization")
    .attr("height", height)
    .attr("margin-left", "350px")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + outerRadius * .20 + "," + outerRadius * .57 + ")");
*/
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
  
  .attr("transform", "translate(" + width / 2.1 + "," + height / 2.1 + ")");


var formatNumber = d3.format(",d"),
    defaultInfo;

var uniqueYears = ["1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012"];

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
	return -1;
}

// function to convert radians into degrees
function degrees(radians) {
    return radians / Math.PI * 180 - 90;
}


d3.csv("hieterLinksNodes_3.csv", function (csv) {
	//binaryAttribute ->year_source
    nodesByIndex = csv.map(function (el) {
        el.year_source = +el.year_source;
		el.source=+el.source;
        el.index = +el.index; // change to ID b/c want to use that lates
        el.degree = +el.degree; // number of friends (links)
        
        return el;
    });
	
	var nodesByType = d3.nest().key(function (d) {
        return d.year_source;
    }).sortKeys(d3.ascending).entries(nodesByIndex);


nodesByType.forEach(function (type) {
        
        var count = 0;
        type.values.forEach(function (d, i) {
           // console.log(d);
			//count=count+0.25;
			d.plotIndex = count++;
			//d.plotIndex = count;
            nodesByIndex[d.index].plotIndex = d.plotIndex;
        });
        type.count = count - 1;
		//type.count = count - 0.25;
    });

//    nodesByType[0].key = "neg"
//    nodesByType[1].key = "pos"


for (i = 0; i < uniqueYears.length; i++) { 
	nodesByType[i].key=uniqueYears[i];
}

//load edges

d3.csv('hieterLinksEdges.csv', function (csv) {
        edges = [];

        // first convert the data to numeric: this returns array of 413 elements (corresponding to 
        // rows of the spreadsheet (as csv)
        csv = csv.map(function (el) {
            el.source = +el.source;
            el.target = +el.target;
            el.EF_source = +el.EF_source; //originally distance
            el.DomainID_source = +el.DomainID_source; 
            return el;
        });

		
		


// create new object
        var el, sourceType, targetType, linkType;
        // loop over all links (over 413 elements in csv array of link objects)
        for (var ii = 0; ii < csv.length; ii++) {
            el = csv[ii];

			var src_index=findWithAttr(nodesByIndex,"source",el.source);
			var target_index=findWithAttr(nodesByIndex,"source",el.target);
			
			if ( src_index!=-1 & target_index!=-1){
			sourceType=nodesByIndex[src_index].year_source;
            targetType=nodesByIndex[target_index].year_source;
            linkType = "m-m";

            edges.push({
                source: {
                    type: sourceType,
                    node: nodesByIndex[src_index]
                }, // push node object instead of just node index
                target: {
                    type: targetType,
                    node: nodesByIndex[target_index]
                }, // push  node object instead of just node index
                distance: el.distance, // push 
                typeByGender: linkType
            });
		}
        }
		
		radius.domain([0, d3.max([nodesByType[0].count, nodesByType[13].count])]);
		
		svg.selectAll(".axis")
		.data(nodesByType)
		.enter().append("line")
		.attr("class", "axis")
		.attr("transform", function (d) {
			//console.log("Logging transform arg")
			console.log(d)
			return "rotate(" + degrees(angle(d.key)) + ")";
		})
		.attr("x1", radius.range()[0])
		.attr("x2", radius.range()[1]);
		/*.attr("x1", radius(-2))
		.attr("x2", function (d) {
			return radius(d.count + 2);
		});*/
		
		svg.append("text")
            .attr("id", "2000")
            .attr("transform", "rotate(" + degrees(majorAngle) + ")")
            .attr("x", radius(82))
            .attr("y", 0)
            .text("2000")
            .attr("text-anchor", "middle")
            .attr("style", "fill: white")
            .attr("transform", "" + degrees(majorAngle))
            .attr("dy", 200);

        svg.append("text")
            .attr("id", "1999")
            .attr("x", 20)
            .attr("y", 0)
            .text("1999")
            .attr("text-anchor", "middle")
            .attr("style", "fill: white")
            .attr("dy", -290)
            .attr("dx", 0);

		
		// Draw the links.
        svg.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(edges)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", link()
                .angle(function (d) {
                    return angle(d.type);
                })
                .radius(function (d) {
                    return radius(d.node.plotIndex);
                }))
            .attr("stroke", function (d) {
                return linkColor(d.typeByGender);
            })
            .on("mouseover", linkMouseover)
            .on("mouseout", mouseout);
			
			svg.append("g")
            .attr("class", "nodes")
            .selectAll(".type")
            .data(nodesByType)
            .enter().append("g")
            .attr("class", function (d) {
                return d.key + "nodes";
            })
            .attr("transform", function (d) {
                return "rotate(" + degrees(angle(d.key)) + ")";
            })
            .selectAll("circle")
            .data(function (d) {
                return d.values;
            })
            .enter().append("circle")
            .attr("cx", function (d) {
                return radius(d.plotIndex);
            })
            .attr("r", 3)
            .attr("fill", function (d) {
                //return color(d.gender);
				console.log(d);
				return color(d.year_source);
            })
            .on("mouseover", nodeMouseover)
            .on("mouseout", mouseout);
			

			// Highlight the link and connected nodes on mouseover.
        function linkMouseover(d) {
            svg.selectAll(".link").classed("active", function (p) {
                return p === d;
            });
            svg.selectAll("circle").classed("active", function (p) {
                return p === d.source.node || p === d.target.node;
            });
           /* name1.text(d.source.node.name).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            name2.text(d.target.node.name).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            gender1.text(capitalizeFirstLetter(d.source.node.gender)).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            gender2.text(capitalizeFirstLetter(d.target.node.gender)).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            hiv1.text(d.source.node.type).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            hiv2.text(d.target.node.type).style("fill", linkColor(d.typeByGender)).style("opacity", "0.75");
            nodehiv.text("?").style("fill", linkColor(d.typeByGender)).style("opacity", "0.75").style("font-size", "34");*/
        }

        // Highlight the node and connected links on mouseover.
        function nodeMouseover(d) {
            var neiNodeList = [];
            svg.selectAll(".link").classed("active", function (p) {
                if (p.source.node == d) {
                    neiNodeList.push(p.target.node);
                }
                if (p.target.node == d) {
                    neiNodeList.push(p.source.node);
                }
                return p.source.node === d || p.target.node === d;
            });
            /*d3.select(this).classed("active", true);
            nodename.text(d.name);
            nodehiv.text(d.type);
            nodegender.text(capitalizeFirstLetter(d.gender));
            nodefriends.text(d.degree + " friends");

            var percentfemale = d3.sum(neiNodeList.map(
                function (d) {
                    return d.gender == 'female';
                })) / neiNodeList.length;
            var percenthiv = d3.sum(neiNodeList.map(
                function (d) {
                    return d.binaryAttribute;
                })) / neiNodeList.length;
            var pfemale = d3.round(100 * percentfemale, 2) + "%";
            var phiv = d3.round(100 * percenthiv, 2) + "%";

            nodephiv.text(phiv + " of friends are HIV-Positive");
            nodepfemale.text(pfemale + " of friends are female");*/
        }

        // Clear any highlighted nodes or links.
        function mouseout() {
            svg.selectAll(".active").classed("active", false);
           /* name1.text(defaultText);
            name2.text(defaultText);
            gender1.text(defaultText);
            gender2.text(defaultText);
            hiv1.text(defaultText);
            hiv2.text(defaultText);
            nodename.text(defaultText);
            nodehiv.text(defaultText).style("font-size", "16").style("fill", "white").style("opacity", "1");
            nodegender.text(defaultText);
            nodefriends.text(defaultText);
            nodephiv.text(defaultText);
            nodepfemale.text(defaultText);*/
        }

}); //closing edges.csv

}); //closing nodes.csv

// A shape generator for Hive links, based on a source and a target.
// Adapted from http://bost.ocks.org/mike/hive/
// The source and target are defined in polar coordinates (angle and radius).
// Ratio links can also be drawn by using a startRadius and endRadius.
// This class is modeled after d3.svg.chord
function link() {
    var source = function (d) {
        return d.source;
    },
        target = function (d) {
            return d.target;
        },
        angle = function (d) {
            return d.angle;
        },
        startRadius = function (d) {
            return d.radius;
        },
        endRadius = startRadius,
        arcOffset = -Math.PI / 2;

    function link(d, i) {
        var s = node(source, this, d, i),
            t = node(target, this, d, i),
            x;
        if (t.a < s.a) x = t, t = s, s = x;
        if (t.a - s.a > Math.PI) s.a += 2 * Math.PI;
        var a1 = s.a + (t.a - s.a) / 3,
            a2 = t.a - (t.a - s.a) / 3;

        // draw cubic bezier curves for nodes on different axes
        if (s.a != t.a) {
            return s.r0 - s.r1 || t.r0 - t.r1 ? "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0 + "L" + Math.cos(s.a) * s.r1 + "," + Math.sin(s.a) * s.r1 + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1 + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1 + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1 + "L" + Math.cos(t.a) * t.r0 + "," + Math.sin(t.a) * t.r0 + "C" + Math.cos(a2) * t.r0 + "," + Math.sin(a2) * t.r0 + " " + Math.cos(a1) * s.r0 + "," + Math.sin(a1) * s.r0 + " " + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0 : "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0 + "C" + Math.cos(a1) * s.r1 + "," + Math.sin(a1) * s.r1 + " " + Math.cos(a2) * t.r1 + "," + Math.sin(a2) * t.r1 + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1;
        }
        // draw quadratic bezier curves for nodes on same axis
        else {
            a = s.a
            var aCtrl = d.source.type === "pos" ? aCtrl = a + minorAngle * 2 : aCtrl = a - minorAngle * 2
            m = Math.abs(s.r1 - t.r1)
            rCtrl = s.r1 + m
            return "M" + Math.cos(s.a) * s.r0 + "," + Math.sin(s.a) * s.r0 + "Q" + Math.cos(aCtrl) * rCtrl + "," + Math.sin(aCtrl) * rCtrl + " " + Math.cos(t.a) * t.r1 + "," + Math.sin(t.a) * t.r1;
        }
    }

    function node(method, thiz, d, i) {
        var node = method.call(thiz, d, i),
            a = +(typeof angle === "function" ? angle.call(thiz, node, i) : angle) + arcOffset,
            r0 = +(typeof startRadius === "function" ? startRadius.call(thiz, node, i) : startRadius),
            r1 = (startRadius === endRadius ? r0 : +(typeof endRadius === "function" ? endRadius.call(thiz, node, i) : endRadius));
        return {
            r0: r0,
            r1: r1,
            a: a
        };
    }

    link.source = function (_) {
        if (!arguments.length) return source;
        source = _;
        return link;
    };

    link.target = function (_) {
        if (!arguments.length) return target;
        target = _;
        return link;
    };

    link.angle = function (_) {
        if (!arguments.length) return angle;
        angle = _;
        return link;
    };

    link.radius = function (_) {
        if (!arguments.length) return startRadius;
        startRadius = endRadius = _;
        return link;
    };

    link.startRadius = function (_) {
        if (!arguments.length) return startRadius;
        startRadius = _;
        return link;
    };

    link.endRadius = function (_) {
        if (!arguments.length) return endRadius;
        endRadius = _;
        return link;
    };

    return link;
};

// colors for male / female nodes 
function color(g) {
	
    if (g == 1999) {
		//console.log("Inside color function");
		//console.log(g);
        return "steelblue";
    } else {
        return "#FF66CC";
    }
}

// link colors
function linkColor(g) {
    if (g == "f-f") {
        return "#FF66FF";
    } else if (g == "m-m") {
        return "steelblue";
    } else {
        return "#FFCC66";
    }
}
