// Example Activity URL: https://biocollect.ala.org.au/actwaterwatch/bioActivity/create/b3efa2eb-ed40-4dc8-ae0a-0c9f0c25ab0e
// Activity Name: Rapid Appraisal of Riparian Condition (RARC)
// Output model name: rarc_EventAndLocationDetails
// jsMain: https://dl.dropbox.com/s/lm1l0y1x4k75jo1/vegetationCoverTable.js?dl=0
// Minified: https://dl.dropbox.com/s/vpswh9n3878f7pt/vegetationCoverTable.min.js?dl=0
self.data.vegetationCoverTable = ko.observableArray([]);
self.selectedvegetationCoverTableRow = ko.observable();
self.transients.layerRow = function (layerName) {
    var row = ko.utils.arrayFirst(self.data.vegetationCoverTable(), function (row) {
        return row.vegetationCover_parameter() == layerName;
    });

    return row;
};
self.transients.calculateLayers = function (col, param1, param2) {
    var value = 0;
    var p1 = self.transients.layerRow(param1);
    var p2 = self.transients.layerRow(param2);
    var allowed = ["1 - 30%","31 - 60%","> 60%","1 - 5%","6 - 30%","> 30%"];
    if (col == 0 && p1 && p2 && ($.inArray( p1.vegetationCover_transectOne(), allowed ) != -1|| $.inArray( p2.vegetationCover_transectOne(), allowed ) != -1 )) {
        value = 1;
    } else if (col == 1 && p1 && p2 && ($.inArray( p1.vegetationCover_transectTwo(), allowed ) != -1 || $.inArray( p2.vegetationCover_transectTwo(), allowed ) != -1)) {
        value = 1;
    } else if (col == 2 && p1 && p2 && ($.inArray( p1.vegetationCover_transectThree(), allowed ) != -1 || $.inArray( p2.vegetationCover_transectThree(), allowed ) != -1) ) {
        value = 1;
    } else if (col == 3 && p1 && p2 && ($.inArray( p1.vegetationCover_transectFour(), allowed ) != -1 || $.inArray( p2.vegetationCover_transectFour(), allowed ) != -1) ) {
        value = 1;
    }
    return value;
};

self.transients.updateVegetationCoverTableLayers = function () {
    var vegetationCoverTableParameters = ['Total canopy %', 'Native canopy %', 'Total understorey %', 'Native understorey %', 'Total ground cover %', 'Native ground cover %', 'No. of structural layers'];
    var totalTransacts = 4;
    for (var i = 0; i < totalTransacts; i++) {
        var layerCount = self.transients.calculateLayers(i, vegetationCoverTableParameters[0], vegetationCoverTableParameters[1]) +
            self.transients.calculateLayers(i, vegetationCoverTableParameters[2], vegetationCoverTableParameters[3]) +
            self.transients.calculateLayers(i, vegetationCoverTableParameters[4], vegetationCoverTableParameters[5]);
        var total = 0;
        $.each(self.data.vegetationCoverTable(), function (j, row) {
            if(row.vegetationCover_parameter() == 'No. of structural layers') {
                total = total + layerCount;
                if (i == 0) row.vegetationCover_transectOne(layerCount);
                else if (i == 1) row.vegetationCover_transectTwo(layerCount);
                else if (i == 2) row.vegetationCover_transectThree(layerCount);
                else if (i == 3) row.vegetationCover_transectFour(layerCount);
                else if (i == 4) row.vegetationCoverAverageScore(total);
            }
        });


    }
};
self.data.vegetationCoverTable.subscribe(function(obj) {
    self.transients.updateVegetationCoverTableLayers();
});

self.transients.vegetationCoverTableDirtyItems = ko.computed(function () {
    self.transients.updateVegetationCoverTableLayers();
}, this);


self.loadvegetationCoverTable = function (data, append) {
    if (!append) {
        self.data.vegetationCoverTable([]);
    }
    if (data === undefined) {
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "totalCanopy_averageScore": "",
            "totalCanopy_T3": "",
            "vegetationCover_parameter": "Total canopy %",
            "totalCanopy_T4": "",
            "totalCanopy_T1": "",
            "totalCanopy_T2": ""
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "nativeCanopy_T3": "",
            "nativeCanopy_T2": "",
            "nativeCanopy_T1": "",
            "nativeCanopy_T4": "",
            "nativeCanopy_averageScore": "",
            "vegetationCover_parameter": "Native canopy %"
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "totalUnderstorey_averageScore": "",
            "vegetationCover_parameter": "Total understorey %",
            "totalUnderstorey_T4": "",
            "totalUnderstorey_T3": "",
            "totalUnderstorey_T2": "",
            "totalUnderstorey_T1": ""
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "nativeUnderstorey_T4": "",
            "nativeUnderstorey_T2": "",
            "nativeUnderstorey_T3": "",
            "nativeUnderstorey_T1": "",
            "vegetationCover_parameter": "Native understorey %",
            "nativeUnderstorey_averageScore": ""
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "totalGroundCover_T4_score": "",
            "totalGroundCover_T1_score": "",
            "noEdit": true,
            "totalGroundCover_averageScoreTotal": "",
            "totalGroundCover_T2_score": "",
            "vegetationCover_parameter": "Total ground cover %",
            "totalGroundCover_T3_score": ""
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "nativeGroundCover_T4_score": "",
            "nativeGroundCover_T3_score": "",
            "nativeGroundCover_T2_score": "",
            "nativeGroundCover_T1_score": "",
            "nativeGroundCover_averageScoreTotal": "",
            "noEdit": true,
            "vegetationCover_parameter": "Native ground cover %"
        }));
        self.data.vegetationCoverTable.push(new VegetationCoverTableRow({
            "numberOfLayers_T2_score": "",
            "numberOfLayers_T1_score": "",
            "numberOfLayers_T3_score": "",
            "numberOfLayers_averageScoreTotal": "",
            "noEdit": true,
            "numberOfLayers_T4_score": "",
            "vegetationCover_parameter": "No. of structural layers"
        }));
    } else {
        $.each(data, function (i, obj) {
            self.data.vegetationCoverTable.push(new VegetationCoverTableRow(obj));
        });
    }
};

self.addvegetationCoverTableRow = function () {
    var newRow = new VegetationCoverTableRow();
    self.data.vegetationCoverTable.push(newRow);

};
self.removevegetationCoverTableRow = function (row) {
    blockUIWithMessage("<p class='text-center'>Not Permitted</p>");
    setTimeout(function(){
        $.unblockUI();
    }, 1500);

};
self.vegetationCoverTablerowCount = function () {
    return self.data.vegetationCoverTable().length;
};
