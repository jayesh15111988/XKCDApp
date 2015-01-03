/**
 * Created by jayeshkawli on 1/2/15.
 */
"use strict";

angular.module('xkcdComicApp.controllers', []).
    controller('mainPageController', function($scope, $http)  {

        var xAxis, yAxis, colors, x, y, svg, height, width, tip, margin;


        var oldCollection = [], newCollection = [];

        function initializeD3GraphicsLayer() {
            console.log("Initializing ...");
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            console.log("Window height "+ windowHeight + " and width "+windowWidth);

            // D3 graphics and tooltip shamelessly taken from http://bl.ocks.org/Caged/6476579

            margin = {top: 40, right: 20, bottom: 30, left: 40};
                width = windowWidth - margin.left - margin.right;
                height = 500 - margin.top - margin.bottom;

            colors = d3.scale.linear()
                .domain([0,10,20])
                //.range(['#FFB832','#C61C6F'])
                .range(['#B58929','#C61C6F', '#268BD2', '#85992C']);


             x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

             y = d3.scale.linear()
                .range([height, 0]);

             xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

             yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.format("d"));

            tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>"+ d.tagName  + " : " +"</strong> <span style='color:red'>"  + d.numberOfOccurrence + "</span>";
                });
      }

        $scope.getImagesMatchingTags = function() {
           getMatchingImagesWithTag();
        }

        function getMatchingImagesWithTag() {

            if($scope.tagsList.length > 0) {

            var endURLForImagesMatchingTagsList = baseURL + imagesByTagsExtension + "?tagsList="+ $scope.tagsList;
            $http.get(endURLForImagesMatchingTagsList).
                success(function(data, status, headers, config) {
                var imagesCollection = data.imagesArray;
                    console.log("Collection "+imagesCollection);
                    $("div#makeMeScrollable").smoothDivScroll("getHtmlContent",imagesCollection, "replace");

                }).
                error(function(data, status, headers, config) {
                    console.log("Error Occurred while fetching top tags from server " +data);
                });
            }
        }

        $scope.loadImageString = function() {
            var imageString = "<img src='img/demo/field.jpg' alt='Demo image' id='field' />" +
                "<img src='img/demo/gnome.jpg' alt='Demo image' id='gnome' />" +
                "<img src='img/demo/pencils.jpg' alt='Demo image' id='pencils' />" +
                "<img src='img/demo/golf.jpg' alt='Demo image' id='golf' />" +
                "<img src='img/demo/river.jpg' alt='Demo image' id='river' />" +
                "<img src='img/demo/train.jpg' alt='Demo image' id='train' />" +
                "<img src='img/demo/leaf.jpg' alt='Demo image' id='leaf' />" +
                "<img src='img/demo/dog.jpg' alt='Demo image' id='dog' />";
            $("div#makeMeScrollable").smoothDivScroll("getHtmlContent", imageString, "replace");

        }

        function initializeSVGElement() {
            //Remove old SVG Element from document as we are appending it each time
            d3.select("#chart").select("svg").remove();
            svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.call(tip);

        }

        function plotDataWithCollection(topTagsCollection) {

            if(topTagsCollection.length > 0) {
            x.domain(topTagsCollection.map(function(d, i) { return i; }));
            y.domain([0, d3.max(topTagsCollection, function(d) {
                return +d.numberOfOccurrence;
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

            var barLines = svg.selectAll(".bar")
                .data(topTagsCollection)
                .enter().append("rect");


            barLines
                .attr("class", "bar")
                .attr("x", function(d, i) { return x(i); })
                .attr("width", x.rangeBand())
                .attr("y", 0)
                .attr("height", 0)
                .transition()
                .delay(function (d, i) { return i*100; })
                .attr("height", function(d) { return height - y(d.numberOfOccurrence); })
                .attr("y", function(d) { return y(d.numberOfOccurrence); })
                .style('fill',function(d,i){
                    return colors(i)
                });

            barLines.on('mouseover', tip.show)
            barLines.on('mouseout', tip.hide);
            }
        }

        function initializeAndLoadGraphDataWithData(tagsData) {
            initializeSVGElement();
            plotDataWithCollection(tagsData);
        }

        function sendRequestToServerForNumberOfTopTags() {
            if($scope.numberOfTopTagsToRequest <= oldCollection.length) {
                console.log("Loading from existing collection");
                var subsetOfOriginalCollection = oldCollection.slice(0, $scope.numberOfTopTagsToRequest);
                initializeAndLoadGraphDataWithData(subsetOfOriginalCollection);
            }
            else
            {
                var initialIndex = oldCollection.length;
                var finalIndex   = ($scope.numberOfTopTagsToRequest - initialIndex);
                console.log("Requesting from server" + "begin index is "+ initialIndex + " And end index is "+ finalIndex);
                var endURLForTopTagsInfo = baseURL + topTagsExtension + "?beginIndex="+ initialIndex + "&endIndex=" + finalIndex;
                $http.get(endURLForTopTagsInfo).
                    success(function(data, status, headers, config) {
                        oldCollection = oldCollection.concat(data.topTags);
                        console.log("Old Collection length "+oldCollection.length);
                        initializeAndLoadGraphDataWithData(oldCollection);
                    }).
                    error(function(data, status, headers, config) {
                        console.log("Error Occurred while fetching top tags from server " +data);
                    });
            }
        }
        initializeD3GraphicsLayer();
        $scope.numberOfTopTagsToRequest = 5;
        sendRequestToServerForNumberOfTopTags();
        $scope.getTagInfoWith = function(){
          sendRequestToServerForNumberOfTopTags();
        }
    });