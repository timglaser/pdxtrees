/**
 * NeighborhoodService is the provider of data on the neighborhood
 * level (opposed to individual tree level). 
 */
function NeighborhoodService(coreDbService, debugging) {
  
  // Query templates.
  
  // Query for the list of neighborhood names.
  var nbrhdSql = '' + 
                'SELECT ' +
                  'n.cartodb_id as id, ' +
                  'initcap(n.name) as name, ' +
                  'COUNT(*) as num_trees, ' +
                  'MAX(t.height) as tallest, ' +
                  'AVG(t.height) as avg_height ' +
                'FROM neighborhoods_pdx as n ' +
                
                'JOIN heritage_trees_pdx as t ' +
                'ON ST_Intersects(t.the_geom, n.the_geom) ' +
                
                'GROUP BY n.cartodb_id ' +
                'HAVING COUNT(*) > 0 ' +
                
                'ORDER BY n.name';



  // Query for getting the bounds of a given neighborhood.
  var boundsSql = 'SELECT ST_XMin(ST_Extent(the_geom)) as xmin, ST_YMin(ST_Extent(the_geom)) as ymin, ' +
                  'ST_XMax(ST_Extent(the_geom)) as xmax, ST_YMax(ST_Extent(the_geom)) as ymax  ' +
                  'FROM neighborhoods_pdx WHERE cartodb_id=';

  // Query for aggregated tree stats for a given neighborhood.
  var nbrhdTreeStatsSql = '' + 
                'SELECT ' +
                  'COUNT(*) as num_trees, ' +
                  'MAX(t.height) as tallest, ' +
                  'AVG(t.height) as avg_height ' +
                'FROM heritage_trees_pdx as t ' +
            
                'JOIN neighborhoods_pdx as n ' +
                'ON ST_Intersects(t.the_geom, n.the_geom) ' +
              
                'WHERE n.cartodb_id=@NEIGHBORHOOD_ID@ ' +
                'GROUP BY n.cartodb_id ';
  
  
  return {

    /**
     * Provides a list of all neighborhoods via a callback.
     * 
     * @param onSuccess f(neighborhoods:array) {}. Each object in the array 
     * contains the following properties: id, name, num_trees.
     * @param onError f(errorMessage:string) {}
     */
    getNeighborhoods: function (onSuccess, onError) {
      coreDbService.getDataRows(nbrhdSql, onSuccess, onError);
    },

    /**
     * Provides the bounding box for the given neighborhood via a callback.
     *
     * @param neighborhoodId The neighborhood's ID.
     * @param onSuccess f(bounds:google.maps.LatLngBounds) {}
     * @param onError f(errorMessage:string) {}
     */
    getBoundsForNeighborhood: function (neighborhoodId, onSuccess, onError) { 
      var sql = boundsSql + neighborhoodId;

      coreDbService.getDataRows(sql, function(rows) {
        
        if (rows.length !== 1) {
          onError("expected one row of bounds but found " + rows.length);
          return;
        }
        
        var b = rows[0];
        
        if (!(b.xmin && b.ymin && b.xmax && b.ymax)) {
          onError("expected {xmin:val,ymin:val,xmax:val,ymax:val} but found " 
            + JSON.stringify(b));
          return;
        }
        
        var sw = new google.maps.LatLng(b.ymin, b.xmin);
        var ne = new google.maps.LatLng(b.ymax, b.xmax);
        var bounds = new google.maps.LatLngBounds(sw, ne);
        onSuccess(bounds);
        
      }, onError);
      
    },
    
    /**
     * Provides the stats for the aggregated tree stats for the given neighborhood via a callback.
     *
     * @param neighborhoodId The neighborhood's ID.
     * @param onSuccess f(stats:object) {}
     * @param onError f(errorMessage:string) {}
     */
    getNeighborhoodTreeStats: function(neighborhoodId, onSuccess, onError) {
      var sql = nbrhdTreeStatsSql.replace('@NEIGHBORHOOD_ID@', neighborhoodId);

      coreDbService.getDataRows(sql, function(rows) {
        if (debugging) { console.log('stats: ' + JSON.stringify(rows)); }

        if (rows.length === 0) {
          onSuccess({num_trees:0});
          return;
        }

        if (rows.length !== 1) {
          onError("expected one row of tree stats but found " + rows.length);
          return;
        }

        onSuccess(rows[0]);
        
      }, onError);
    }
    
  }; // end of return {};

}
