/**
 * Created by jayeshkawli on 1/2/15.
 */
"use strict";

angular.module('xkcdComicApp.controllers', ['ui.bootstrap']).
    controller('mainPageController', function ($scope, $http, $modal) {

        var xAxis, yAxis, colors, x, y, svg, height, width, tip, margin;
        var oldCollection = [];
        var oldImagesMatchingTags = [];
        var oldImagesFromRange = [];
        var isPresentingModalView = false;

        $scope.toShowMatchingTagsImages = true;
        $scope.toShowInputRangeImages = true;

        $scope.getTagsByImageIdentifier = function(inputImageIdentifier, imageTitle) {
            var endURLForTagsWithImageIdentifier = baseURL + imageTagsCollection + "?imageIdentifier=" + inputImageIdentifier;
            $http.get(endURLForTagsWithImageIdentifier).
                success(function (data, status, headers, config) {
                    var allTags = data.tagsCollection;
                    var escapedAllTagsString = $('<textarea />').html(allTags).text();
                    $scope.open(escapedAllTagsString, imageTitle);
                }).
                error(function (data, status, headers, config) {
                    console.log("Error Occurred while fetching collection of tags for image with given identifier " + data);
                });
        }

        $scope.open = function (message, imageTitle) {
            isPresentingModalView = true;
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    inputMessage : function() {
                        return {body: message, title : imageTitle};
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                isPresentingModalView = false;
                console.log("Modal dismissed with ok button");
            }, function () {
                isPresentingModalView = false;
                console.log("Modal dismissed With cancel button");
            });
        };



        function initializeD3GraphicsLayer() {

            var windowWidth = $(window).width();
            var windowHeight = $(window).height();


            // D3 graphics and tooltip shamelessly taken from http://bl.ocks.org/Caged/6476579

            margin = {top: 40, right: 20, bottom: 30, left: 40};
            width = windowWidth - margin.left - margin.right;
            height = 500 - margin.top - margin.bottom;

            colors = d3.scale.linear()
                .domain([0, 10, 20])
                //.range(['#FFB832','#C61C6F'])
                .range(['#B58929', '#C61C6F', '#268BD2', '#85992C']);


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
                .html(function (d) {
                    return "<strong>" + d.tagName + " : " + "</strong> <span style='color:red'>" + d.numberOfOccurrence + "</span>";
                });
        }

        function getImagesWithInputRange() {


            //Hard coding url extension, cause Angular JS is a piece of shit just like Swift which would fault at any time it wants.
            //This is absurd and don't know why it fucking happens here - FIXED for now!
            if(oldImagesFromRange.length == 0)
            {
                $scope.maximumHeightForSequenceImages = "300px";
                console.log("From server");
            var endURLForImagesInputRange = baseURL + imagesByInputRange + "?startIndex=" + $scope.imageStartIndex+"&endIndex="+$scope.imageEndIndex;
            $http.get(endURLForImagesInputRange).
                success(function (data, status, headers, config) {
                    var imagesCollection = data.imagesArray;
                    oldImagesFromRange = imagesCollection;
                    if(imagesCollection.length > 0) {
                        $("div.imagesFromSequence").smoothDivScroll("getHtmlContent", imagesCollection, "replace");
                    }
                    else {
                        $("div.imagesFromSequence").smoothDivScroll("getHtmlContent", "<div></div>", "replace");
                        if(isPresentingModalView == false) {
                            $scope.open("No images matching input sequence found in the database","Message from XKCD comic app");
                        }
                    }
                    $scope.maximumHeightForSequenceImages = data.maxHeight;
                }).
                error(function (data, status, headers, config) {
                    console.log("Error Occurred while fetching top tags from server " + data);
                });
        }
        else {
                console.log("From cache");
                $("div.imagesFromSequence").smoothDivScroll("getHtmlContent", oldImagesFromRange, "replace");
        }
        }

        function getMatchingImagesWithTag() {

            if ($scope.tagsList.length > 0) {

                if(oldImagesMatchingTags.length == 0){
                $scope.maximumHeight = "300px";
                    console.log("From server");
                var endURLForImagesMatchingTagsList = baseURL + imagesByTagsExtension + "?tagsList=" + $scope.tagsList;
                $http.get(endURLForImagesMatchingTagsList).
                    success(function (data, status, headers, config) {


                        var imagesCollection = data.imagesArray;
                        oldImagesMatchingTags = imagesCollection;
                        if(imagesCollection.length > 0) {
                            $("div.makeMeScrollable").smoothDivScroll("getHtmlContent", imagesCollection, "replace");
                        } else {
                            $("div.makeMeScrollable").smoothDivScroll("getHtmlContent", "<div></div>", "replace");
                            if(isPresentingModalView == false) {
                                $scope.open("No images matching combination of given tag(s) found in the database", "Message from XKCD comic app");
                            }
                        }
                        $scope.maximumHeight = data.maxHeight
                    }).
                    error(function (data, status, headers, config) {
                        console.log("Error Occurred while fetching top tags from server " + data);
                    });
            }
                else {
                    console.log("From cache");
                    $("div.makeMeScrollable").smoothDivScroll("getHtmlContent", oldImagesMatchingTags, "replace");
                }
            }
        }

        /*$scope.loadImageString = function() {
         var imageString = "<img src='img/demo/field.jpg' alt='Demo image' id='field' />" +
         "<img src='img/demo/gnome.jpg' alt='Demo image' id='gnome' />" +
         "<img src='img/demo/pencils.jpg' alt='Demo image' id='pencils' />" +
         "<img src='img/demo/golf.jpg' alt='Demo image' id='golf' />" +
         "<img src='img/demo/river.jpg' alt='Demo image' id='river' />" +
         "<img src='img/demo/train.jpg' alt='Demo image' id='train' />" +
         "<img src='img/demo/leaf.jpg' alt='Demo image' id='leaf' />" +
         "<img src='img/demo/dog.jpg' alt='Demo image' id='dog' />";
         $("div.makeMeScrollable").smoothDivScroll("getHtmlContent", imageString, "replace");

         }*/

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

            if (topTagsCollection.length > 0) {
                x.domain(topTagsCollection.map(function (d, i) {
                    return i;
                }));
                y.domain([0, d3.max(topTagsCollection, function (d) {
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
                    .attr("x", function (d, i) {
                        return x(i);
                    })
                    .attr("width", x.rangeBand())
                    .attr("y", 0)
                    .attr("height", 0)
                    .transition()
                    .delay(function (d, i) {
                        return i * 100;
                    })
                    .attr("height", function (d) {
                        return height - y(d.numberOfOccurrence);
                    })
                    .attr("y", function (d) {
                        return y(d.numberOfOccurrence);
                    })
                    .style('fill', function (d, i) {
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
            if ($scope.numberOfTopTagsToRequest <= oldCollection.length) {
                console.log("Loading from existing collection");
                var subsetOfOriginalCollection = oldCollection.slice(0, $scope.numberOfTopTagsToRequest);
                initializeAndLoadGraphDataWithData(subsetOfOriginalCollection);
            }
            else {
                var initialIndex = oldCollection.length;
                var finalIndex = ($scope.numberOfTopTagsToRequest - initialIndex);
                console.log("Requesting from server" + "begin index is " + initialIndex + " And end index is " + finalIndex);
                var endURLForTopTagsInfo = baseURL + topTagsExtension + "?beginIndex=" + initialIndex + "&endIndex=" + finalIndex;
                $http.get(endURLForTopTagsInfo).
                    success(function (data, status, headers, config) {
                        oldCollection = oldCollection.concat(data.topTags);
                        console.log("Old Collection length " + oldCollection.length);
                        initializeAndLoadGraphDataWithData(oldCollection);
                    }).
                    error(function (data, status, headers, config) {
                        console.log("Error Occurred while fetching top tags from server " + data);
                    });
            }
        }

        function setupWatchParameters(){
            $scope.$watch('numberOfTopTagsToRequest', function(newValue, oldValue) {
                if(oldValue !== newValue){
                    $scope.tagInfoButtonIsDisabled = (isNaN(newValue) || (newValue.length < 1));
                }
            }, true);

            $scope.$watch('tagsList', function(newValue, oldValue) {
                if(oldValue !== newValue){
                    $scope.imagesByTagButtonIsDisabled = ((typeof  newValue === "undefined") || (newValue.length < 2) );
                }
            }, true);

            $scope.$watch('[imageStartIndex, imageEndIndex]', function(newValue, oldValue) {
                $scope.imagesByRangeButtonIsDisabled = (!newValue[0] || !newValue[1] || (newValue[1] < newValue[0]));
            }, true);


        }

        //Initialize all data before loading the page
        initializeD3GraphicsLayer();
        $scope.numberOfTopTagsToRequest = 5;
        $scope.imageStartIndex  = 1;
        $scope.imageEndIndex = 10;
        $scope.tagsList = 'world';

        //Variable for enabling and disabling buttons
        $scope.tagInfoButtonIsDisabled = false;
        $scope.imagesByTagButtonIsDisabled = false;
        $scope.imagesByRangeButtonIsDisabled = false;

        sendRequestToServerForNumberOfTopTags();
        getMatchingImagesWithTag();
        getImagesWithInputRange();

        setupWatchParameters();

        $scope.getTagInfoWith = function () {
            sendRequestToServerForNumberOfTopTags();
        }

        //Classic code smell - This should really be fixed to make getMatchingImagesWithTag and other call only once.
        //There is some issue fixing album height before image is loaded. Need to load image one more time after images
        //Are loaded from href. Not sure how this can be fixed in more graceful fashion

        $scope.getImagesMatchingTags = function () {
            oldImagesMatchingTags = [];
            getMatchingImagesWithTag();
                setTimeout(function(){
                    getMatchingImagesWithTag();
                    oldImagesMatchingTags = [];
                }, 1500);
        }

        $scope.getImagesFromRange = function () {
            oldImagesFromRange = [];
            getImagesWithInputRange();
                setTimeout(function(){
                    getImagesWithInputRange();
                    oldImagesFromRange = [];
                }, 1500);
        }
    });

angular.module('xkcdComicApp.controllers').controller('ModalInstanceCtrl', function ($scope, $modalInstance, inputMessage) {

    $scope.modalMessage = inputMessage.body;
    $scope.modalTitle = inputMessage.title;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});