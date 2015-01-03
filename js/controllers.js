/**
 * Created by jayeshkawli on 1/2/15.
 */
angular.module('xkcdComicApp.controllers', []).
    controller('mainPageController', function($scope, $http)  {



        $scope.numberOfTopTagsToRequest = 10;
        $scope.getTagInfoWith = function(){

            var endURLForTopTagsInfo = baseURL + topTagsExtension + "?beginIndex="+ 0 + "&endIndex=" + $scope.numberOfTopTagsToRequest;
            $http.get(endURLForTopTagsInfo).
                success(function(data, status, headers, config) {
                    var windowWidth = $(window).width();
                    var windowHeight = $(window).height();
                    console.log("Window height "+ windowHeight + " and width "+windowWidth);
                    var margin = {top: 40, right: 20, bottom: 30, left: 40},
                        width = windowWidth - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom;

                    var formatPercent = d3.format("d");

                    var x = d3.scale.ordinal()
                        .rangeRoundBands([0, width], .1);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickFormat(formatPercent);

                    var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-10, 0])
                        .html(function(d) {
                            return "<strong>"+ d.tagName  +"</strong> <span style='color:red'>" + " : " + d.numberOfOccurrence + "</span>";
                        });

                    var svg = d3.select("#chart").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    svg.call(tip);

                    var topTagsCollection = data.topTags;

                    x.domain(topTagsCollection.map(function(d, i) { return i; }));
                    y.domain([0, d3.max(topTagsCollection, function(d) {
                        return +d['numberOfOccurrence'];
                    })]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -10)
                        .attr("dy", "0")
                        .attr("x", 40)
                        .style("text-anchor", "end")
                        .text("Frequency");

                    svg.selectAll(".bar")
                        .data(topTagsCollection)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d, i) { return x(i); })
                        .attr("width", x.rangeBand())
                        .attr("y", function(d) { return y(d.numberOfOccurrence); })
                        .attr("height", function(d) { return height - y(d.numberOfOccurrence); })
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide)

                    console.log(JSON.stringify(topTagsCollection));
                }).
                error(function(data, status, headers, config) {
                    console.log("Error Occurred while fetching top tags from server " +data);
                });



        }
    });