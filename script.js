/* Place your JavaScript in this file */
class TideStation {
    constructor(name, id, isCurrent, isHarmonic, refStationID, predictions, startDate, endDate) {
        this.name = name;
        this.id = id;
        this.isCurrent = isCurrent;
        this.isHarmonic = isHarmonic;
        this.refStationID = refStationID;
        this.predictions = predictions;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

// Define the tide stations
var tideStationArray = []
tideStationArray[0] = new TideStation('Valdez', '9454240', false, true, 0, undefined, undefined, undefined);
tideStationArray[1] = new TideStation('Nikiski', '9455760', false, true, 0 ,undefined, undefined, undefined);
tideStationArray[2] = new TideStation('Port Angeles', '9444090', false, true, 0, undefined, undefined, undefined);
tideStationArray[3] = new TideStation('Cherry Point', '9449424', false, true, 0, undefined, undefined, undefined);
tideStationArray[4] = new TideStation('Swinomish Channel - Padilla Bay', '9448682', false, true, 0, undefined, undefined, undefined);
tideStationArray[5] = new TideStation('San Francisco (Golden Gate)', '9414290', false, true, 0, undefined, undefined, undefined);
tideStationArray[6] = new TideStation('Richmond', '9414863', false, true, 0 , undefined, undefined, undefined);
tideStationArray[7] = new TideStation('Martinez', '9415102', false, true, 0 ,undefined, undefined, undefined);
tideStationArray[8] = new TideStation('Long Beach', '9410680', false, true, 0 ,undefined, undefined, undefined);
tideStationArray[9] = new TideStation('Tesoro Pier 15 foot (Currents)', 'COI0801', true, true, 0, undefined, undefined, undefined);

// setup the array to show on the drop down 
var size = tideStationArray.length;
for (var i = 0; i < size; i++) {
    var value = tideStationArray[i].id;
    var name = tideStationArray[i].name;
    //console.log(value, name);
    let newOption = new Option(name, value);
    //console.log(newOption);
    $('#Station').append(newOption, undefined);
}

// make the graph syntax:
//<div class="bar"><div id="bar0" class="green">00:00</div><div id="h0" class="white"></div></div>
var a = "<div class='bar'><div class='negative' id='neg";
var b = "'></div><div id='bar";
var c = "' class='green'></div><div id='h";
var d = "' class='white'></div></div>";
for (var i = 0; i < 49; i++) {
    //var time = tideStationArray[index].predictions[j].t;
    //var timeShort = time.slice(-5);
    var div = a + i + b + i + c + i + d;
    $('#graph-cont').append(div);
}

// clear the graph
for (var i = 0; i < 49; i++) {
    var bar = "bar" + i;
    var h = "h" + i;
    document.getElementById(h).innerHTML = "";
}

// GLOBALS:
var index, station;
var dateStart;
var dateEnd;
var scaleMax = 13;
var scaleMin = -2;

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getTides() {
    station = $("#Station").val();
    dateStart = $("#dateStart").val();
    dateEnd = dateStart;

    var dStart = new Date(dateStart);
    var dEnd = addDays(dStart, 1);
    //console.log(dEnd);
    
    //const offset = dStart.getTimezoneOffset()
    //var dEndFormat = new Date(dEnd.getTime() - (offset*60*1000))
    var dEndFormat = dEnd.toISOString().split('T')[0]
    console.log(dEndFormat)


    // find the index of the tide station:
    for (var i = 0; i < size; i++) {
        var id = tideStationArray[i].id;
        //if (parseInt(tideStationArray[i].id) == station) {
        //        index = i;
        //}
        if (id.localeCompare(station) == 0) {
            console.log("match ", i);
            index = i;
        }
    }

    // format dates for use in API
    var dateStartArray = dateStart.split(/-/);
    var dateEndArray = dEndFormat.split(/-/);

    // generate URL - tides
    if (tideStationArray[index].isCurrent == false) {
        var url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=" + dateStartArray[0] + dateStartArray[1] + dateStartArray[2] + "&end_date=" + dateEndArray[0] + dateEndArray[1] + dateEndArray[2] + "&station=" + station + "&product=predictions&datum=MLLW&time_zone=lst_ldt&units=english&format=json";
        console.log("URL to NOAA: " + url);
    }

    // generate URL - currents:
    if (tideStationArray[index].isCurrent == true) {
        console.log("is current station");
        url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=" + dateStartArray[0] + dateStartArray[1] + dateStartArray[2] + "&range=24&station=" + station + "&product=currents_predictions&time_zone=lst_ldt&interval=30&units=english&application=tides1&format=json"
        console.log("URL to NOAA: " + url);
    }

    // make an ajax call to noaa tides
    $.ajax({
        async: false,
        url: url,
        dataType: "json",
        success: function (data) {
        //console.log(data);
        if (tideStationArray[index].isCurrent == false) {
            tideStationArray[index].predictions = data.predictions;
            console.log(tideStationArray[index].predictions);
        }
        if (tideStationArray[index].isCurrent == true) {
            tideStationArray[index].predictions = data.current_predictions.cp;
            console.log(tideStationArray[index].predictions);
        }
        }
    })

    // clear the graph
    for (var i = 0; i < 49; i++) {
        var bar = "bar" + i;
        var h = "h" + i;
        document.getElementById(h).innerHTML = "";
    }

    // tides:
    if (tideStationArray[index].isCurrent == false){
        // iterate through the tides array to fin a min and max
        var maxT = 0;
        var minT = 0;
        var iMax = tideStationArray[index].predictions.length;
        if (iMax > 230) {
            iMax = 241;
        }
        console.log("I max " + iMax);
        for(var i = 0; i < iMax; i++) {
            var heightOfTide = tideStationArray[index].predictions[i].v;
            heightOfTide = parseInt(heightOfTide);
            if (heightOfTide > maxT) {
                maxT = heightOfTide;
            }
            if (heightOfTide < minT) {
                minT = heightOfTide;
            }
            console.log(heightOfTide, minT, maxT);
        }
        scaleMax = maxT + 2;
        if (minT < 0) {
            scaleMin = minT - 2;
        }

        // get heights for half hour
        if (iMax < 241) {

        }
        for(var i = 0, j = 0; i < 49; i++, j += 5) {
            // height of tide
            var heightOfTide = tideStationArray[index].predictions[j].v;

            // size negative div
            var barNegative = -100 * scaleMin / (scaleMax - scaleMin)
            var neg = "neg" + i;
            var bar = "bar" + i;
            var h = "h" + i;
            //handle negative tides:
            if (heightOfTide < 0) {
                var percentHT = heightOfTide / scaleMin;
                var barPercent = percentHT * barNegative;
                barNegative = barNegative - barPercent;
            }
            else {
                // get the remaining percent for the tide bar after the scaleMin
                var remainingPercent = (100 - barNegative) / 100;
                // ajdust height of tide bar
                var barPercent = ((heightOfTide/scaleMax) * 100) * remainingPercent;
            }
            if (iMax < 241 && i >= 47) {
                var bar = "bar" + i;
                var h = "h" + i;
                document.getElementById(h).innerHTML = "";
            }
            document.getElementById(neg).style.width = barNegative + "%";
            // add time labels
            var timeLabel = tideStationArray[index].predictions[j].t;
            timeLabel = timeLabel.slice(-5);
            document.getElementById(neg).innerHTML = timeLabel;




            document.getElementById(bar).style.width = barPercent + "%";
            var hString = heightOfTide = Math.round(heightOfTide * 10)/10;
            document.getElementById(h).append(hString.toFixed(1));
        }
    }

    var title = document.getElementById('graphTitle');
    title.innerHTML = tideStationArray[index].name + " on " + dateStart;

    // Currents:
    if (tideStationArray[index].isCurrent == true){
        scaleMax = 6;
        scaleMin = -6;

        // find max and min for scale
        var localVmax = 0;
        var localVmin = 0;
        for(var i = 0; i < 49; i++) {
            var velocity = tideStationArray[index].predictions[i].Velocity_Major;
            if (velocity > localVmax) {
                localVmax = velocity;
            }
            if (velocity < localVmin) {
                localVmin = velocity;
            }
        }
        scaleMax = localVmax + 1;
        scaleMin = localVmin - 1;

        for(var i = 0; i < 49; i++) {
            // height of tide
            var heightOfTide = tideStationArray[index].predictions[i].Velocity_Major;

            // size negative div
            var barNegative = -100 * scaleMin / (scaleMax - scaleMin)
            var neg = "neg" + i;
            var bar = "bar" + i;
            var h = "h" + i;
            //handle negative tides:
            if (heightOfTide < 0) {
                var percentHT = heightOfTide / scaleMin;
                var barPercent = percentHT * barNegative;
                barNegative = barNegative - barPercent;
            }
            else {
                // get the remaining percent for the tide bar after the scaleMin
                var remainingPercent = (100 - barNegative) / 100;
                // ajdust height of tide bar
                var barPercent = ((heightOfTide/scaleMax) * 100) * remainingPercent;
            }
            /*if (iMax < 241 && i >= 47) {
                var bar = "bar" + i;
                var h = "h" + i;
                document.getElementById(h).innerHTML = "";
            }*/
            document.getElementById(neg).style.width = barNegative + "%";
            // add time labels
            var timeLabel = tideStationArray[index].predictions[i].Time;
            timeLabel = timeLabel.slice(-5);
            document.getElementById(neg).innerHTML = timeLabel;




            document.getElementById(bar).style.width = barPercent + "%";
            var hString = heightOfTide = Math.round(heightOfTide * 10)/10;
            document.getElementById(h).append(hString.toFixed(1));
        }

    }
    
}
