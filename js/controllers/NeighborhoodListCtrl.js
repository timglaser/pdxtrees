/**
 * neighborhoodListCtrl
 */
function neighborhoodListCtrl($scope, $http, mapService) {
  'use strict';
  //
  // This code only used to grab JSON from CartoDB that is then 
  // here into the controller.
  //
/*
  var rootQueryUrl = 'http://timglaser.cartodb.com/api/v2/sql?q=';
  var nbrhdSql = '' + 
      'SELECT ' +
        'n.cartodb_id as id, ' +
        'initcap(n.name) as name, ' +

        'COUNT(*) as numTrees, ' +
        'MAX(t.height) as tallest, ' +
        'AVG(t.height) as avgHeight, ' +
        
        'ST_XMin(ST_Extent(n.the_geom)) as xmin, ' +
        'ST_YMin(ST_Extent(n.the_geom)) as ymin, ' +
        'ST_XMax(ST_Extent(n.the_geom)) as xmax, '+
        'ST_YMax(ST_Extent(n.the_geom)) as ymax  ' +
        
      'FROM neighborhoods_pdx as n ' +
      
      'JOIN heritage_trees_pdx as t ' +
      'ON ST_Intersects(t.the_geom, n.the_geom) ' +
      
      'GROUP BY n.cartodb_id ' +
      'HAVING COUNT(*) > 0 ' +
      
      'ORDER BY n.name';
  
  $http.get(rootQueryUrl + nbrhdSql).success(function(data, status, headers, config) {
    console.log(angular.toJson(data.rows));
  }).error(function(data, status, headers, config) {
    console.log('FAIL: '+ (data||{}).error +'.  Http status is ' + status);
  });
*/
  //
  // End of JSON grab code.
  //

  $scope.neighborhoods = [
    {
      "id": 31,
      "name": "Alameda",
      "numtrees": 5,
      "tallest": 120,
      "avgheight": 69,
      "xmin": -122.64419103622,
      "ymin": 45.5420536263168,
      "xmax": -122.624991096921,
      "ymax": 45.5554244900793
    },
    {
      "id": 42,
      "name": "Alameda/Irvington",
      "numtrees": 2,
      "tallest": 85,
      "avgheight": 80.5,
      "xmin": -122.644231194084,
      "ymin": 45.5420536263168,
      "xmax": -122.63907770195,
      "ymax": 45.5482338803692
    },
    {
      "id": 19,
      "name": "Arbor Lodge",
      "numtrees": 4,
      "tallest": 114,
      "avgheight": 68.5,
      "xmin": -122.707958971649,
      "ymin": 45.5663008953409,
      "xmax": -122.678576495426,
      "ymax": 45.5772074545448
    },
    {
      "id": 118,
      "name": "Ardenwald-Johnson Creek",
      "numtrees": 1,
      "tallest": 80,
      "avgheight": 80,
      "xmin": -122.638959097811,
      "ymin": 45.4585071688558,
      "xmax": -122.622235050677,
      "ymax": 45.4653510664259
    },
    {
      "id": 69,
      "name": "Arlington Heights",
      "numtrees": 3,
      "tallest": 73,
      "avgheight": 62.666666666666664,
      "xmin": -122.714996743636,
      "ymin": 45.5119511177006,
      "xmax": -122.699444772898,
      "ymax": 45.5242378622
    },
    {
      "id": 129,
      "name": "Arnold Creek",
      "numtrees": 1,
      "tallest": 75,
      "avgheight": 75,
      "xmin": -122.712854329188,
      "ymin": 45.4325360077235,
      "xmax": -122.683494514804,
      "ymax": 45.4496173648476
    },
    {
      "id": 29,
      "name": "Beaumont-Wilshire",
      "numtrees": 1,
      "tallest": 40,
      "avgheight": 40,
      "xmin": -122.630688876093,
      "ymin": 45.5414949333761,
      "xmax": -122.614698008865,
      "ymax": 45.5582983171137
    },
    {
      "id": 32,
      "name": "Boise",
      "numtrees": 2,
      "tallest": 60,
      "avgheight": 60,
      "xmin": -122.678809283401,
      "ymin": 45.5435543509487,
      "xmax": -122.661586695801,
      "ymax": 45.5546332412304
    },
    {
      "id": 113,
      "name": "Brentwood-Darlington",
      "numtrees": 1,
      "tallest": 80,
      "avgheight": 80,
      "xmin": -122.616468910918,
      "ymin": 45.4607530183609,
      "xmax": -122.579047498465,
      "ymax": 45.4763007599622
    },
    {
      "id": 93,
      "name": "Bridlemile",
      "numtrees": 2,
      "tallest": 85,
      "avgheight": 65,
      "xmin": -122.745487633279,
      "ymin": 45.4818373403409,
      "xmax": -122.708492193357,
      "ymax": 45.4988414109446
    },
    {
      "id": 92,
      "name": "Brooklyn Action Corps",
      "numtrees": 6,
      "tallest": 100,
      "avgheight": 70,
      "xmin": -122.670287602728,
      "ymin": 45.4746747555506,
      "xmax": -122.639571627341,
      "ymax": 45.5015454384013
    },
    {
      "id": 73,
      "name": "Buckman",
      "numtrees": 6,
      "tallest": 110,
      "avgheight": 93.66666666666667,
      "xmin": -122.670766131441,
      "ymin": 45.512071351697,
      "xmax": -122.63707878523,
      "ymax": 45.5236068486844
    },
    {
      "id": 10,
      "name": "Cathedral Park",
      "numtrees": 3,
      "tallest": 85,
      "avgheight": 85,
      "xmin": -122.775140083681,
      "ymin": 45.5764120318377,
      "xmax": -122.738537810883,
      "ymax": 45.5989123698381
    },
    {
      "id": 84,
      "name": "Centennial",
      "numtrees": 1,
      "tallest": 50,
      "avgheight": 50,
      "xmin": -122.517780491869,
      "ymin": 45.4920036227177,
      "xmax": -122.479503150638,
      "ymax": 45.5191874052066
    },
    {
      "id": 21,
      "name": "Concordia",
      "numtrees": 1,
      "tallest": 45,
      "avgheight": 45,
      "xmin": -122.643948761772,
      "ymin": 45.5553829986633,
      "xmax": -122.620402959151,
      "ymax": 45.5765764355904
    },
    {
      "id": 94,
      "name": "Creston-Kenilworth",
      "numtrees": 4,
      "tallest": 80,
      "avgheight": 72.5,
      "xmin": -122.639618205922,
      "ymin": 45.4902739746136,
      "xmax": -122.6006143521,
      "ymax": 45.4979403407675
    },
    {
      "id": 18,
      "name": "Cully",
      "numtrees": 1,
      "tallest": 50,
      "avgheight": 50,
      "xmin": -122.620513417606,
      "ymin": 45.5482192201772,
      "xmax": -122.577645385043,
      "ymax": 45.5789596484304
    },
    {
      "id": 74,
      "name": "Downtown",
      "numtrees": 8,
      "tallest": 105,
      "avgheight": 59.75,
      "xmin": -122.689547317251,
      "ymin": 45.5053532488906,
      "xmax": -122.668814596319,
      "ymax": 45.523123776585
    },
    {
      "id": 109,
      "name": "Eastmoreland",
      "numtrees": 5,
      "tallest": 66,
      "avgheight": 57.2,
      "xmin": -122.642416326019,
      "ymin": 45.4634560658655,
      "xmax": -122.622514175856,
      "ymax": 45.4816826640804
    },
    {
      "id": 108,
      "name": "Eastmoreland/Reed",
      "numtrees": 5,
      "tallest": 80,
      "avgheight": 62.4,
      "xmin": -122.639817254381,
      "ymin": 45.4788145466535,
      "xmax": -122.622648020054,
      "ymax": 45.4847568145705
    },
    {
      "id": 39,
      "name": "Eliot",
      "numtrees": 2,
      "tallest": 77,
      "avgheight": 68.5,
      "xmin": -122.682907378748,
      "ymin": 45.5318509028144,
      "xmax": -122.658589453925,
      "ymax": 45.5482742832706
    },
    {
      "id": 6,
      "name": "Forest Park",
      "numtrees": 2,
      "tallest": 242,
      "avgheight": 158.5,
      "xmin": -122.836749383029,
      "ymin": 45.5166768874287,
      "xmax": -122.712063687908,
      "ymax": 45.6075147471594
    },
    {
      "id": 70,
      "name": "Goose Hollow",
      "numtrees": 12,
      "tallest": 107,
      "avgheight": 78.41666666666667,
      "xmin": -122.701618961576,
      "ymin": 45.5132235146537,
      "xmax": -122.685507130052,
      "ymax": 45.5237964635128
    },
    {
      "id": 78,
      "name": "Goose Hollow/Southwest Hills",
      "numtrees": 1,
      "tallest": 48,
      "avgheight": 48,
      "xmin": -122.697386173378,
      "ymin": 45.5088410173986,
      "xmax": -122.688362448057,
      "ymax": 45.5184108421044
    },
    {
      "id": 51,
      "name": "Grant Park",
      "numtrees": 1,
      "tallest": 90,
      "avgheight": 90,
      "xmin": -122.639117957858,
      "ymin": 45.53515178692,
      "xmax": -122.61496777494,
      "ymax": 45.5436451247373
    },
    {
      "id": 107,
      "name": "Hayhurst",
      "numtrees": 1,
      "tallest": 92,
      "avgheight": 92,
      "xmin": -122.747388781763,
      "ymin": 45.4760727367998,
      "xmax": -122.707723422425,
      "ymax": 45.4872072235416
    },
    {
      "id": 67,
      "name": "Hazelwood",
      "numtrees": 1,
      "tallest": 145,
      "avgheight": 145,
      "xmin": -122.565526029358,
      "ymin": 45.5040581802444,
      "xmax": -122.508285989029,
      "ymax": 45.5341232855353
    },
    {
      "id": 95,
      "name": "Hillsdale",
      "numtrees": 12,
      "tallest": 150,
      "avgheight": 99.91666666666667,
      "xmin": -122.712777453536,
      "ymin": 45.4645260369953,
      "xmax": -122.679164417297,
      "ymax": 45.4963753661645
    },
    {
      "id": 65,
      "name": "Hillside",
      "numtrees": 2,
      "tallest": 112,
      "avgheight": 71,
      "xmin": -122.728692982102,
      "ymin": 45.518916868383,
      "xmax": -122.701936805631,
      "ymax": 45.5324251198597
    },
    {
      "id": 62,
      "name": "Hillside/Northwest District",
      "numtrees": 4,
      "tallest": 90,
      "avgheight": 38,
      "xmin": -122.710573060679,
      "ymin": 45.5234774131879,
      "xmax": -122.69830040701,
      "ymax": 45.5330792607111
    },
    {
      "id": 85,
      "name": "Hosford-Abernethy",
      "numtrees": 10,
      "tallest": 80,
      "avgheight": 54.5,
      "xmin": -122.670737771035,
      "ymin": 45.497357936741,
      "xmax": -122.635558402813,
      "ymax": 45.5131567239139
    },
    {
      "id": 40,
      "name": "Irvington",
      "numtrees": 28,
      "tallest": 105,
      "avgheight": 70.96428571428571,
      "xmin": -122.65860076584,
      "ymin": 45.5350118410573,
      "xmax": -122.639100522411,
      "ymax": 45.5482671559169
    },
    {
      "id": 5,
      "name": "Kenton",
      "numtrees": 3,
      "tallest": 84,
      "avgheight": 73.33333333333333,
      "xmin": -122.724598437834,
      "ymin": 45.5771267760917,
      "xmax": -122.678512760336,
      "ymax": 45.6143425587169
    },
    {
      "id": 63,
      "name": "Kerns",
      "numtrees": 2,
      "tallest": 87,
      "avgheight": 87,
      "xmin": -122.669287687602,
      "ymin": 45.5193067222453,
      "xmax": -122.630641457842,
      "ymax": 45.5345073469399
    },
    {
      "id": 26,
      "name": "King",
      "numtrees": 2,
      "tallest": 100,
      "avgheight": 77.5,
      "xmin": -122.664797870975,
      "ymin": 45.548253055569,
      "xmax": -122.650681622558,
      "ymax": 45.5664283914935
    },
    {
      "id": 61,
      "name": "Laurelhurst",
      "numtrees": 10,
      "tallest": 135,
      "avgheight": 69.8,
      "xmin": -122.632095143589,
      "ymin": 45.5192809787922,
      "xmax": -122.617290583813,
      "ymax": 45.5346819827293
    },
    {
      "id": 97,
      "name": "Lents",
      "numtrees": 1,
      "tallest": 56,
      "avgheight": 56,
      "xmin": -122.579065704473,
      "ymin": 45.4576483426824,
      "xmax": -122.547600547279,
      "ymax": 45.4974109425339
    },
    {
      "id": 57,
      "name": "Lloyd District",
      "numtrees": 1,
      "tallest": 72,
      "avgheight": 72,
      "xmin": -122.674146181512,
      "ymin": 45.5252106127586,
      "xmax": -122.650473240391,
      "ymax": 45.5351119965089
    },
    {
      "id": 111,
      "name": "Maplewood",
      "numtrees": 1,
      "tallest": 75,
      "avgheight": 75,
      "xmin": -122.744953634094,
      "ymin": 45.4674496880354,
      "xmax": -122.723130005811,
      "ymax": 45.4763689404646
    },
    {
      "id": 120,
      "name": "Marshall Park",
      "numtrees": 1,
      "tallest": 66,
      "avgheight": 66,
      "xmin": -122.70249611927,
      "ymin": 45.4455104543454,
      "xmax": -122.684848953195,
      "ymax": 45.4634837244289
    },
    {
      "id": 60,
      "name": "Montavilla",
      "numtrees": 1,
      "tallest": 120,
      "avgheight": 120,
      "xmin": -122.593474412658,
      "ymin": 45.5044218682333,
      "xmax": -122.56537069713,
      "ymax": 45.5356648864165
    },
    {
      "id": 103,
      "name": "Mt. Scott-Arleta",
      "numtrees": 1,
      "tallest": 90,
      "avgheight": 90,
      "xmin": -122.602231779092,
      "ymin": 45.4758582435576,
      "xmax": -122.578947123481,
      "ymax": 45.4914459546271
    },
    {
      "id": 75,
      "name": "Mt. Tabor",
      "numtrees": 11,
      "tallest": 200,
      "avgheight": 121.36363636363636,
      "xmin": -122.613452028151,
      "ymin": 45.5053036750352,
      "xmax": -122.584742470288,
      "ymax": 45.5232220476973
    },
    {
      "id": 112,
      "name": "Multnomah",
      "numtrees": 2,
      "tallest": 70,
      "avgheight": 65,
      "xmin": -122.726533513436,
      "ymin": 45.4535122018468,
      "xmax": -122.696347612844,
      "ymax": 45.4762360282055
    },
    {
      "id": 66,
      "name": "North Tabor",
      "numtrees": 3,
      "tallest": 96,
      "avgheight": 60.666666666666664,
      "xmin": -122.617307931245,
      "ymin": 45.5192736983163,
      "xmax": -122.592376960025,
      "ymax": 45.5338971929289
    },
    {
      "id": 45,
      "name": "Northwest District",
      "numtrees": 15,
      "tallest": 110,
      "avgheight": 78.6,
      "xmin": -122.725243834174,
      "ymin": 45.5228756162876,
      "xmax": -122.682907378748,
      "ymax": 45.5450197514162
    },
    {
      "id": 68,
      "name": "Old Town/Chinatown",
      "numtrees": 7,
      "tallest": 58,
      "avgheight": 46.42857142857143,
      "xmin": -122.677722947784,
      "ymin": 45.5187523286578,
      "xmax": -122.667536263365,
      "ymax": 45.5318509028144
    },
    {
      "id": 20,
      "name": "Overlook",
      "numtrees": 10,
      "tallest": 110,
      "avgheight": 68.5,
      "xmin": -122.728512686038,
      "ymin": 45.5379733056943,
      "xmax": -122.676074320459,
      "ymax": 45.57530025035
    },
    {
      "id": 44,
      "name": "Parkrose Heights",
      "numtrees": 1,
      "tallest": 65,
      "avgheight": 65,
      "xmin": -122.560227264758,
      "ymin": 45.5334671312938,
      "xmax": -122.537443088949,
      "ymax": 45.5476927800546
    },
    {
      "id": 101,
      "name": "Pleasant Valley",
      "numtrees": 1,
      "tallest": 165,
      "avgheight": 165,
      "xmin": -122.549379142082,
      "ymin": 45.4537848982577,
      "xmax": -122.483155522806,
      "ymax": 45.4954909496677
    },
    {
      "id": 12,
      "name": "Portsmouth",
      "numtrees": 6,
      "tallest": 60,
      "avgheight": 40.666666666666664,
      "xmin": -122.735756954275,
      "ymin": 45.5771267760917,
      "xmax": -122.705416270443,
      "ymax": 45.5961522271214
    },
    {
      "id": 105,
      "name": "Reed",
      "numtrees": 2,
      "tallest": 65,
      "avgheight": 65,
      "xmin": -122.643391833317,
      "ymin": 45.4813588175079,
      "xmax": -122.622639261974,
      "ymax": 45.4906020832092
    },
    {
      "id": 86,
      "name": "Richmond",
      "numtrees": 8,
      "tallest": 66,
      "avgheight": 46.25,
      "xmin": -122.636133769688,
      "ymin": 45.4967819730632,
      "xmax": -122.608991506124,
      "ymax": 45.5120694740252
    },
    {
      "id": 43,
      "name": "Rose City Park",
      "numtrees": 1,
      "tallest": 59,
      "avgheight": 59,
      "xmin": -122.615010625951,
      "ymin": 45.5272718198559,
      "xmax": -122.596267439914,
      "ymax": 45.5482847156397
    },
    {
      "id": 30,
      "name": "Sabin",
      "numtrees": 1,
      "tallest": 76,
      "avgheight": 76,
      "xmin": -122.655713000984,
      "ymin": 45.5482331035647,
      "xmax": -122.641936032289,
      "ymax": 45.5577153950659
    },
    {
      "id": 41,
      "name": "Sabin/Irvington",
      "numtrees": 1,
      "tallest": 25,
      "avgheight": 25,
      "xmin": -122.654476413236,
      "ymin": 45.5451605853695,
      "xmax": -122.64419103622,
      "ymax": 45.5482498788833
    },
    {
      "id": 104,
      "name": "Sellwood-Moreland Improvement League",
      "numtrees": 16,
      "tallest": 112,
      "avgheight": 67,
      "xmin": -122.666847576117,
      "ymin": 45.4553570216837,
      "xmax": -122.638387953871,
      "ymax": 45.4903462300651
    },
    {
      "id": 87,
      "name": "South Portland",
      "numtrees": 5,
      "tallest": 102,
      "avgheight": 70.2,
      "xmin": -122.685966811057,
      "ymin": 45.4643464607316,
      "xmax": -122.664111624077,
      "ymax": 45.5084583332482
    },
    {
      "id": 89,
      "name": "South Tabor",
      "numtrees": 1,
      "tallest": 47,
      "avgheight": 47,
      "xmin": -122.609047553964,
      "ymin": 45.4974109425339,
      "xmax": -122.578681061691,
      "ymax": 45.5054113241985
    },
    {
      "id": 79,
      "name": "Southwest Hills",
      "numtrees": 11,
      "tallest": 115,
      "avgheight": 86.18181818181819,
      "xmin": -122.743818442995,
      "ymin": 45.4904969015612,
      "xmax": -122.685083492875,
      "ymax": 45.5182976463641
    },
    {
      "id": 58,
      "name": "Sullivan's Gulch",
      "numtrees": 5,
      "tallest": 100,
      "avgheight": 72,
      "xmin": -122.650474956979,
      "ymin": 45.5296867457799,
      "xmax": -122.630641457842,
      "ymax": 45.5351610258799
    },
    {
      "id": 80,
      "name": "Sunnyside",
      "numtrees": 5,
      "tallest": 80,
      "avgheight": 58.2,
      "xmin": -122.637130208785,
      "ymin": 45.5120227841001,
      "xmax": -122.612358464792,
      "ymax": 45.5193117451036
    },
    {
      "id": 14,
      "name": "University Park",
      "numtrees": 3,
      "tallest": 80,
      "avgheight": 61.666666666666664,
      "xmin": -122.747726563206,
      "ymin": 45.5642353039542,
      "xmax": -122.707944575169,
      "ymax": 45.5863025650701
    },
    {
      "id": 106,
      "name": "Woodstock",
      "numtrees": 9,
      "tallest": 90,
      "avgheight": 47.888888888888886,
      "xmin": -122.622849176896,
      "ymin": 45.4646679808152,
      "xmax": -122.601306359547,
      "ymax": 45.4902946792264
    }
  ];


  var _selectedNeighborhood = null;

  $scope.getSelected = function () {
    return _selectedNeighborhood;
  };

  /**
   * To be triggered when a neighborhood has been selected in the UI.
   */
  $scope.selectNeighborhood = function (neighborhood) {

    _selectedNeighborhood = neighborhood;

    // Update the neighborhood list.
    angular.forEach($scope.neighborhoods, function (nbrhd) {
      nbrhd.selected = nbrhd.id === _selectedNeighborhood.id ? true : false;
    });

    // Slide to details pane.
    $('#sidebar.carousel').carousel('next');

    // Update map.
    mapService.focusOnNeighborhood(_selectedNeighborhood);
  };

  $scope.showNeighborhoodsList = function () {
    $('#sidebar.carousel').carousel('prev');
  };

}

neighborhoodListCtrl.$inject = ['$scope', '$http', 'mapService'];