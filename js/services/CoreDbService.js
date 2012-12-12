/**
 * CoreDbService is a base level retreival service.
 */
function CoreDbService($http, rootQueryUrl, debugging) {

  return {
    /**
     * Provides, via callback, the 'data.rows' array found in the JSON retreived
     * from a postGIS query.
     * 
     * @param sql The postGIS SQL statement.
     * @param onSuccess This callback provides an array of data rows as a paramater.
     * @param onError Optional. This callback takes an error message as it's one 
     * parameter.
     */
    getDataRows: function (sql, onSuccess, onError) {
  
      if (debugging) { console.log('GET: ' + sql); }
      $http.get(rootQueryUrl + sql).
      
      success(function(data, status, headers, config) {
        if (debugging) { console.log('GOT: ' + (data||{}).total_rows +' rows'); }
        onSuccess( (data||{}).rows || [] );
      }).
      
      error(function(data, status, headers, config) {
        if (debugging) { console.log('FAIL: '+ (data||{}).error +'.  Http status is ' + status); }
        if (onError) {
          onError(data.error);
        }
      });
    } 
  
  };
}