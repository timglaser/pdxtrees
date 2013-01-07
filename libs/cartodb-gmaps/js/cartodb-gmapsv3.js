/**
 * @name cartodb-gmapsv3 for Google Maps V3 API
 * @version 0.54 [September 11, 2012]
 * @author: Vizzuality.com
 * @fileoverview <b>Author:</b> Vizzuality.com<br/> <b>Licence:</b>
 *               Licensed under <a
 *               href="http://opensource.org/licenses/mit-license.php">MIT</a>
 *               license.<br/> This library lets you use CartoDB with google
 *               maps v3.
 *
 */

// Namespace
var CartoDB = CartoDB || {};

if (typeof(google.maps.CartoDBLayer) === "undefined") {

   /**
     * Initialize CartoDB Layer
     * @params {Object}
     *    map               -     Your google map
     *    user_name         -     CartoDB user name
     *    table_name        -     CartoDB table name
     *    query             -     If you want to apply any sql sentence to the table...
     *    opacity           -     If you want to change the opacity of the CartoDB layer
     *    layer_order       -     If you want to change the position order of the CartoDB layer
     *    tile_style        -     If you want to add other style to the layer
     *    map_style         -     Show the same style as you defined in the CartoDB map
     *    interactivity     -     Get data from the feature clicked ( without any request :) )
     *    featureOver       -     Callback when user hovers a feature (return mouse event, latlng and data)
     *    featureOut        -     Callback when user hovers out a feature
     *    featureClick      -     Callback when user clicks a feature (return mouse event, latlng and data)
     *    debug             -     Get error messages from the library
     *    auto_bound        -     Let cartodb auto-bound-zoom in the map (opcional - default = false)
     *
     *    tiler_domain      -     Use your own tiler domain
     *    tiler_port        -     Use your current tiler port
     *    tiler_protocol    -     http or https?
     *    sql_domain        -     Use your own sql domain
     *    sql_port          -     Use your current sql port
     *    sql_protocol      -     http or https?
     */


    function CartoDBLayer(options) {
      // Extend from OverlayView
      this.extend(CartoDBLayer, google.maps.OverlayView);

      // Extend options
      this.options = {
        query:          "SELECT * FROM {{table_name}}",
        opacity:        1,
        auto_bound:     false,
        debug:          false,
        visible:        true,
        added:          false,
        loaded:         null,
        loading:        null, 
        layer_order:    "top",
        tiler_domain:   "cartodb.com",
        tiler_port:     "80",
        tiler_protocol: "http",
        sql_domain:     "cartodb.com",
        sql_port:       "80",
        sql_protocol:   "http"
      }
      this.options = this._extend({}, this.options, options);

      // Hack to prevent setOptions OverlayView default function
      this.setOptions = function(options) {
        google.maps.OverlayView.prototype.setOptions.call(this, {});
        this._setOptions(options);
      }

      // Some checks
      if (!this.options.table_name || !this.options.map) {
        if (this.options.debug) {
          throw('cartodb-gmapsv3 needs at least a CartoDB table name and the gmapsv3 map object :(');
        } else { return }
      }

      this.initialize();
      this.setMap(options.map);
    }

    CartoDBLayer.prototype.extend = function(obj1, obj2) {
      return (function(object) {
        for (var property in object.prototype) {
          this.prototype[property] = object.prototype[property];
        }
        return this;
      }).apply(obj1, [obj2]);
    };


    CartoDBLayer.prototype.initialize = function () {
      // Bounds? CartoDB does it
      if (this.options.auto_bound)
        this.setBounds();

      // Map style?
      if (this.options.map_style)
        this._setMapStyle();

      // Add cartodb logo, yes sir!
      this._addWadus();
    }

    // Useless
    CartoDBLayer.prototype.draw = function() {};


    /**
     * When Google adds the layer... go!
     * @params {map}
     */
    CartoDBLayer.prototype.onAdd = function(map) {
      this._addInteraction();

      this.options.added = true;

      google.maps.event.trigger(this, 'added');
    }


    /**
     * When removes the layer, destroy interactivity if exist
     */
    CartoDBLayer.prototype.onRemove = function(map) {
      this._remove();

      // Remove tilesloaded listener
      if (this.loaded)
        google.maps.event.removeListener(this.loaded);

      this.options.added = false;

      google.maps.event.trigger(this, 'removed');
    }


    /**
     * Change opacity of the layer
     * @params {Integer} New opacity
     */
    CartoDBLayer.prototype.setOpacity = function(opacity) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (isNaN(opacity) || opacity>1 || opacity<0) {
        if (this.options.debug) {
          throw(opacity + ' is not a valid value');
        } else { return }
      }

      // Set the new value to the layer options
      this.options.opacity = opacity;
      this._update();
    }


    /**
     * Change query of the tiles
     * @params {str} New sql for the tiles
     * @params {Boolean}  Choose if the map fits to the sql results bounds (thanks to @fgblanch)
     */
    CartoDBLayer.prototype.setQuery = function(sql, fitToBounds) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (!isNaN(sql)) {
        if (this.options.debug) {
         throw(sql + ' is not a valid query');
        } else { return }
      }

      if (fitToBounds)
        this.setBounds(sql)

      // Set the new value to the layer options
      this.options.query = sql;
      this._update();
    }


    /**
     * Change style of the tiles
     * @params {style} New carto for the tiles
     */
    CartoDBLayer.prototype.setStyle = function(style) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (!isNaN(style)) {
        if (this.options.debug) {
          throw(style + ' is not a valid style');
        } else { return }
      }

      // Set the new value to the layer options
      this.options.tile_style = style;
      this._update();
    }


    /**
     * Change the query when clicks in a feature
     * @params { Boolean || String } New sql for the request
     */
    CartoDBLayer.prototype.setInteractivity = function(value) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (!isNaN(value)) {
        if (this.options.debug) {
          throw(value + ' is not a valid setInteractivity value');
        } else { return }
      }

      // Set the new value to the layer options
      this.options.interactivity = value;
      // Update tiles
      this._update();
    }


    /**
     * Change layer index
     * @params { Integer || String } New position for the layer
     */
    CartoDBLayer.prototype.setLayerOrder = function(position) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (isNaN(position) && position != "top" && position != "bottom") {
        if (this.options.debug) {
          throw(position + ' is not a valid layer position')
        } else { return }
      }

      // Remove gmaps position defined
      if (this.layer.gmaps_index)
        delete this.layer.gmaps_index;
      // Set new value
      this.options.layer_order = position;
      // Layer order time!
      this._setLayerOrder();
    }


    /**
     * Active or desactive interaction
     * @params {Boolean} Choose if wants interaction or not
     */
    CartoDBLayer.prototype.setInteraction = function(bool) {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (bool !== false && bool !== true) {
        if (this.options.debug) {
          throw(bool + ' is not a valid setInteraction value');
        } else { return }
      }

      if (this.interaction) {
        if (bool) {
          var self= this;
          this.interaction.on('on',function(o) {self._bindWaxOnEvents(self.options.map,o)})
          this.interaction.on('off',function(o) {self._bindWaxOffEvents()})
        } else {
          this.interaction.off('on');
          this.interaction.off('off');
        }
      }
    }


    /**
     * Change multiple options at the same time
     * @params {Object} New options object
     */
    CartoDBLayer.prototype._setOptions = function(options) {
      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (typeof options!= "object" || options.length) {
        if (this.options.debug) {
          throw(options + ' options has to be an object');
        } else { return }
      }

      // Set options
      this.options = this._extend({}, this.options, options);

      this._update();
    }


    /**
     * Hide the CartoDB layer
     */
    CartoDBLayer.prototype.hide = function() {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (!this.options.visible) {
        if (this.options.debug) {
          throw('the layer is already hidden');
        } else { return }
      }

      this.options.visible = false;
      // Save previous opacity
      this.options.before = this.options.opacity;
      // Hide it!
      this.setOpacity(0);
      this.setInteraction(false);

      google.maps.event.trigger(this, 'hidden');
    }


    /**
     * Show the CartoDB layer
     */
    CartoDBLayer.prototype.show = function() {

      if (!this.options.added) {
        if (this.options.debug) {
          throw('the layer is not still added to the map');
        } else { return }
      }

      if (this.options.visible) {
        if (this.options.debug) {
          throw('the layer is already shown');
        } else { return }
      }

      this.options.visible = true;
      this.setOpacity(this.options.before);
      // Remove before
      delete this.options.before;
      this.setInteraction(true);

      google.maps.event.trigger(this, 'shown');
    }


    /**
     * Return the visibility of the layer
     */
    CartoDBLayer.prototype.isVisible = function() {
      return this.options.visible
    }


    /**
     * Returns if the layer belongs to the map or not
     */
    CartoDBLayer.prototype.isAdded = function() {
      return this.options.added
    }



    /*
     * PRIVATE METHODS
     */

    /**
     * Remove CartoDB layer
     */
    CartoDBLayer.prototype._remove =  function() {
      // Disable interaction
      this.setInteraction(false);

      // Remove interaction
      if (this.interaction)
        this.interaction.remove();

      // Remove layer
      var self = this;
      this.options.map.overlayMapTypes.forEach(
        function(layer,i) {
          if (layer == self.layer) {
            self.options.map.overlayMapTypes.removeAt(i);
            return;
          }
        }
      );

    }


    /**
     * Update CartoDB layer
     */
    CartoDBLayer.prototype._update = function() {
      // First remove old layer
      this._remove();

      // Create the new updated one
      this._addInteraction();

      google.maps.event.trigger(this, 'updated');
    }


    /**
     * Zoom to cartodb geometries
     * @param {String} If it specifies a sql, it bounds over it, if not, using the default one
     */
    CartoDBLayer.prototype.setBounds = function(sql) {
      var self = this;

      if (!sql) {
        var sql = this.options.query;
      }

      reqwest({
        url: this._generateCoreUrl("sql") + '/api/v2/sql/?q='+escape('SELECT ST_XMin(ST_Extent(the_geom)) as minx,ST_YMin(ST_Extent(the_geom)) as miny,'+
          'ST_XMax(ST_Extent(the_geom)) as maxx,ST_YMax(ST_Extent(the_geom)) as maxy from ('+ sql.replace(/\{\{table_name\}\}/g,this.options.table_name) + ') as subq'),
        type: 'jsonp',
        jsonpCallback: 'callback',
        success: function(result) {
          if (result.rows[0].maxx!=null) {
            var coordinates = result.rows[0];

            var lon0 = coordinates.maxx;
            var lat0 = coordinates.maxy;
            var lon1 = coordinates.minx;
            var lat1 = coordinates.miny;

            var minlat = -85.0511;
            var maxlat =  85.0511;
            var minlon = -179;
            var maxlon =  179;

            /* Clamp X to be between min and max (inclusive) */
            var clampNum = function(x, min, max) {
              return x < min ? min : x > max ? max : x;
            }

            lon0 = clampNum(lon0, minlon, maxlon);
            lon1 = clampNum(lon1, minlon, maxlon);
            lat0 = clampNum(lat0, minlat, maxlat);
            lat1 = clampNum(lat1, minlat, maxlat);

            var ne = new google.maps.LatLng(lat0, lon0);
            var sw = new google.maps.LatLng(lat1, lon1);
            var bounds = new google.maps.LatLngBounds(sw,ne);
            self.options.map.fitBounds(bounds);
          }
        },
        error: function(e,msg) {
          if (this.options.debug) throw('Error getting table bounds: ' + msg);
        }
      });
    }


    /**
     * Add Wadus
     */
    CartoDBLayer.prototype._addWadus =  function() {
      var self = this;
      setTimeout(function(){
        if (!document.getElementById('cartodb_logo')) {
          var cartodb_link = document.createElement("a");
          cartodb_link.setAttribute('id','cartodb_logo');
          cartodb_link.setAttribute('style',"position:absolute; bottom:3px; left:74px; display:block; border:none; z-index:100");
          cartodb_link.setAttribute('href','http://www.cartodb.com');
          cartodb_link.setAttribute('target','_blank');
          cartodb_link.innerHTML = "<img src='http://cartodb.s3.amazonaws.com/static/new_logo.png' alt='CartoDB' title='CartoDB' style='border:none;' />";
          self.options.map.getDiv().appendChild(cartodb_link)
        }
      },2000);
    }


    /**
     * Set the map styles of your CartoDB table/map
     */
    CartoDBLayer.prototype._setMapStyle = function () {
      var self = this;
      reqwest({
        url: this._generateCoreUrl("tiler") + '/tiles/' + this.options.table_name + '/map_metadata?callback=?',
        type: 'jsonp',
        jsonpCallback: 'callback',
        success: function(result) {
          var map_style = json_parse(result.map_metadata);

          if (!map_style || map_style.google_maps_base_type=="roadmap") {
            self.map.setOptions({mapTypeId: google.maps.MapTypeId.ROADMAP});
          } else if (map_style.google_maps_base_type=="satellite") {
            self.map.setOptions({mapTypeId: google.maps.MapTypeId.SATELLITE});
          } else if (map_style.google_maps_base_type=="terrain") {
            self.map.setOptions({mapTypeId: google.maps.MapTypeId.TERRAIN});
          } else {
            var mapStyles = [ { stylers: [ { saturation: -65 }, { gamma: 1.52 } ] },{ featureType: "administrative", stylers: [ { saturation: -95 }, { gamma: 2.26 } ] },{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "administrative.locality", stylers: [ { visibility: "off" } ] },{ featureType: "road", stylers: [ { visibility: "simplified" }, { saturation: -99 }, { gamma: 2.22 } ] },{ featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "off" } ] },{ featureType: "road.local", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "transit", stylers: [ { visibility: "off" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", stylers: [ { saturation: -55 } ] } ];
            map_style.google_maps_customization_style = mapStyles;
            self.map.setOptions({mapTypeId: google.maps.MapTypeId.ROADMAP});
          }

          // Custom tiles
          if (!map_style) {
            map_style = {google_maps_customization_style: []};
          }

          self.map.setOptions({styles: map_style.google_maps_customization_style});
        },
        error: function(e, msg) {
          if (params.debug) throw('Error getting map style: ' + msg);
        }
      });
    }


    /**
     * Add interaction cartodb tiles to the map
     */
    CartoDBLayer.prototype._addInteraction = function () {

      var self = this;

      // interaction placeholder
      this.tilejson = this._generateTileJson();

      // Layer created
      this.layer = new wax.g.connector(this.tilejson);
      
      // Loading event
      this.loaded = google.maps.event.addListener(this.options.map, "tilesloaded", function(ev){
        google.maps.event.trigger(self, 'loaded');
      });

      // Setting its order
      this._setLayerOrder();

      // Check the tiles
      this._checkTiles();

      // Adding interaction if it is necessary
      if (this.options.interactivity) {
        this.interaction = wax.g.interaction()
          .map(this.options.map)
          .tilejson(this.tilejson)
          .on('on',function(o) { self._bindWaxOnEvents(self.options.map,o) })
          .on('off', function(o) { self._bindWaxOffEvents() });
      }
    }


    /**
     * Bind on events for wax interaction
     * @param {Object} Layer map object
     * @param {Event} Wax event
     */
    CartoDBLayer.prototype._bindWaxOnEvents = function(map,o) {
      var point = this._findPos(map,o)
      , latlng = this.getProjection().fromContainerPixelToLatLng(point);

      switch (o.e.type) {
        case 'mousemove': if (this.options.featureOver) {
                            return this.options.featureOver(o.e,latlng,point,o.data);
                          } else {
                            if (this.options.debug) throw('featureOver function not defined');
                          }
                          break;
        case 'click':     if (this.options.featureClick) {
                            this.options.featureClick(o.e,latlng,point,o.data);
                          } else {
                            if (this.options.debug) throw('featureClick function not defined');
                          }
                          break;
        case 'touchend':  if (this.options.featureClick) {
                            this.options.featureClick(o.e,latlng,point,o.data);
                          } else {
                            if (this.options.debug) throw('featureClick function not defined');
                          }
                          break;
        default:          break;
      }
    }


    /**
     * Bind off event for wax interaction
     */
    CartoDBLayer.prototype._bindWaxOffEvents = function(){
      if (this.options.featureOut) {
        return this.options.featureOut && this.options.featureOut();
      } else {
        if (this.options.debug) throw('featureOut function not defined');
      }
    }


    /**
     * Generate tilejson for wax
     * @return {Object} Options for ImageMapType
     */
    CartoDBLayer.prototype._generateTileJson = function() {
      var urls = this._generateTileUrls();

      // Build up the tileJSON
      return {
        blankImage: '../img/blank_tile.png',
        tilejson: '1.0.0',
        scheme: 'xyz',
        name: this.options.table_name,
        tiles: [urls.tile_url],
        grids: [urls.grid_url],
        tiles_base: urls.tile_url,
        grids_base: urls.grid_url,
        opacity: this.options.opacity,
        formatter: function(options, data) {
          return data
        }
      };
    }


    /**
     * Set the layer order
     */
    CartoDBLayer.prototype._setLayerOrder = function() {

      // Remove this layer from the order array if it is present
      var self = this;
      this.options.map.overlayMapTypes.forEach(function(l,i){
        if (l == self.layer) {
          self.options.map.overlayMapTypes.removeAt(i);
        }
      })

      // Was it previously attached?
      if (this.layer.gmaps_index) {
        this.options.map.overlayMapTypes.insertAt(this.layer.gmaps_index,this.layer)
        return;
      }

      // String positions
      if (this.options.layer_order == "top") {
        this.options.map.overlayMapTypes.push(this.layer);
        return;
      }
      if (this.options.layer_order == "bottom") {
        this.options.map.overlayMapTypes.insertAt(0,this.layer);
        return;
      }

      // Number positions
      var actual_length = this.options.map.overlayMapTypes.getLength()
      if (this.options.layer_order >= actual_length) {
        // Add it at the end
        this.options.map.overlayMapTypes.push(this.layer);
      } else if (this.options.layer_order <= 0) {
        // 0 dude!
        this.options.map.overlayMapTypes.insertAt(0,this.layer);
      } else {
        // Add in the correct index
        this.options.map.overlayMapTypes.insertAt(this.options.layer_order,this.layer);
      }

      // New layer, new indexes, let's check them!
      this.options.map.overlayMapTypes.forEach(function(l,i){
        l.gmaps_index = i
      })
    }


    /*
     * HELPER FUNCTIONS
     */

    /**
     * Generate a URL about sql api or tile api
     * @params {String} Type of url
     */
     CartoDBLayer.prototype._generateCoreUrl = function(type) {
       if (type == "sql") {
         return this.options.sql_protocol +
             "://" + ((this.options.user_name)?this.options.user_name+".":"")  +
             this.options.sql_domain +
             ((this.options.sql_port != "") ? (":" + this.options.sql_port) : "");
       } else {
         return this.options.tiler_protocol +
             "://" + ((this.options.user_name)?this.options.user_name+".":"")  +
             this.options.tiler_domain +
             ((this.options.tiler_port != "") ? (":" + this.options.tiler_port) : "");
       }
     }

    /**
     * Generate the final tile and grid URLs for the tiler
     */
    CartoDBLayer.prototype._generateTileUrls = function() {
      var core_url = this._generateCoreUrl("tiler")
        , base_url = core_url + '/tiles/' + this.options.table_name + '/{z}/{x}/{y}'
        , tile_url = base_url + '.png'
        , grid_url = base_url + '.grid.json';

      // SQL?
      if (this.options.query) {
        var q = encodeURIComponent(this.options.query.replace(/\{\{table_name\}\}/g,this.options.table_name));
        q = q.replace(/%7Bx%7D/g,"{x}").replace(/%7By%7D/g,"{y}").replace(/%7Bz%7D/g,"{z}");
        var query = 'sql=' +  q
        tile_url = this._addUrlData(tile_url, query);
        grid_url = this._addUrlData(grid_url, query);
      }

      // EXTRA PARAMS?
      for (_param in this.options.extra_params) {
        tile_url = this._addUrlData(tile_url, _param+"="+this.options.extra_params[_param]);
        grid_url = this._addUrlData(grid_url, _param+"="+this.options.extra_params[_param]);
      }

      // STYLE?
      if (this.options.tile_style) {
        var style = 'style=' + encodeURIComponent(this.options.tile_style.replace(/\{\{table_name\}\}/g,this.options.table_name));
        tile_url = this._addUrlData(tile_url, style);
        grid_url = this._addUrlData(grid_url, style);
      }

      // INTERACTIVITY?
      if (this.options.interactivity) {
        var interactivity = 'interactivity=' + encodeURIComponent(this.options.interactivity.replace(/ /g,''));
        tile_url = this._addUrlData(tile_url, interactivity);
        grid_url = this._addUrlData(grid_url, interactivity);
      }

      return {
        core_url: core_url,
        base_url: base_url,
        tile_url: tile_url,
        grid_url: grid_url
      }
    },


    /**
     * Parse URI
     * @params {String} Tile url
     * @return {String} URI parsed
     */
    CartoDBLayer.prototype._parseUri = function (str) {
      var o = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
          name:   "queryKey",
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      },
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i   = 14;

      while (i--) uri[o.key[i]] = m[i] || "";

      uri[o.q.name] = {};
      uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
      });
      return uri;
    }


    /**
     * Appends callback onto urls regardless of existing query params
     * @params {String} Tile url
     * @params {String} Tile data
     * @return {String} Tile url parsed
     */
    CartoDBLayer.prototype._addUrlData = function (url, data) {
      url += (this._parseUri(url).query) ? '&' : '?';
      return url += data;
    }


    /**
     * Merge src properties into dest
     * @params {obj} Dest
     */
    CartoDBLayer.prototype._extend = function (/*Object*/ dest) /*-> Object*/ {
      var sources = Array.prototype.slice.call(arguments, 1);
      for (var j = 0, len = sources.length, src; j < len; j++) {
        src = sources[j] || {};
        for (var i in src) {
          if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
          }
        }
      }
      return dest;
    }


    /**
     * Calculate the correct offset to get the latlng clicked or touched
     * @params {obj} Map dom element
     * @params {obj} Wax event object
     */
    CartoDBLayer.prototype._findPos = function (map,o) {
      var curleft = curtop = 0;
      var obj = map.getDiv();

      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return new google.maps.Point((o.e.clientX || o.e.changedTouches[0].clientX) - curleft,(o.e.clientY || o.e.changedTouches[0].clientY) - curtop)
    }


    /**
     * Check if the tile is ok or fails
     */
    CartoDBLayer.prototype._checkTiles = function() {
      var xyz = {z: 4, x: 6, y: 6}
        , self = this
        , img = new Image()
        , urls = this._generateTileUrls()

      // Choose a x-y-z for the check tile - grid
      urls.tile_url = urls.tile_url.replace(/\{z\}/g,xyz.z).replace(/\{x\}/g,xyz.x).replace(/\{y\}/g,xyz.y);
      urls.grid_url = urls.grid_url.replace(/\{z\}/g,xyz.z).replace(/\{x\}/g,xyz.x).replace(/\{y\}/g,xyz.y);


      reqwest({
        method: "get",
        url: urls.grid_url,
        type: 'jsonp',
        jsonpCallback: 'callback',
        jsonpCallbackName: 'grid',
        success: function() {
          clearTimeout(timeout)
        },
        error: function(error,msg) {
          if (self.interaction)
            self.interaction.remove();

          if (self.options.debug) 
            throw('There is an error in your query or your interaction parameter');

          google.maps.event.trigger(this, 'layererror', msg);
        }
      });

      // Hacky for reqwest, due to timeout doesn't work very well
      var timeout = setTimeout(function(){
        clearTimeout(timeout);

        if (self.interaction)
          self.interaction.remove();

        if (self.options.debug)
          throw('There is an error in your query or your interaction parameter');

        google.maps.event.trigger(this, 'layererror', "There is a problem in your SQL or interaction parameter");
      },2000);
    }

  }


/* json2.js 2012-10-08 https://github.com/douglascrockford/JSON-js */
if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

var json_parse = JSON.parse;


/*!
  * Reqwest! A general purpose XHR connection manager
  * (c) Dustin Diaz 2011
  * https://github.com/ded/reqwest
  * license MIT
  */
!function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&define.amd?define(a,b):this[a]=b()}("reqwest",function(){function handleReadyState(a,b,c){return function(){a&&a[readyState]==4&&(twoHundo.test(a.status)?b(a):c(a))}}function setHeaders(a,b){var c=b.headers||{},d;c.Accept=c.Accept||defaultHeaders.accept[b.type]||defaultHeaders.accept["*"],!b.crossOrigin&&!c[requestedWith]&&(c[requestedWith]=defaultHeaders.requestedWith),c[contentType]||(c[contentType]=b.contentType||defaultHeaders.contentType);for(d in c)c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d])}function generalCallback(a){lastValue=a}function urlappend(a,b){return a+(/\?/.test(a)?"&":"?")+b}function handleJsonp(a,b,c,d){var e=uniqid++,f=a.jsonpCallback||"callback",g=a.jsonpCallbackName||"reqwest_"+e,h=new RegExp("((^|\\?|&)"+f+")=([^&]+)"),i=d.match(h),j=doc.createElement("script"),k=0;i?i[3]==="?"?d=d.replace(h,"$1="+g):g=i[3]:d=urlappend(d,f+"="+g),win[g]=generalCallback,j.type="text/javascript",j.src=d,j.async=!0,typeof j.onreadystatechange!="undefined"&&(j.event="onclick",j.htmlFor=j.id="_reqwest_"+e),j.onload=j.onreadystatechange=function(){if(j[readyState]&&j[readyState]!=="complete"&&j[readyState]!=="loaded"||k)return!1;j.onload=j.onreadystatechange=null,j.onclick&&j.onclick(),a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(j),k=1},head.appendChild(j)}function getRequest(a,b,c){var d=(a.method||"GET").toUpperCase(),e=typeof a=="string"?a:a.url,f=a.processData!==!1&&a.data&&typeof a.data!="string"?reqwest.toQueryString(a.data):a.data||null,g;return(a.type=="jsonp"||d=="GET")&&f&&(e=urlappend(e,f),f=null),a.type=="jsonp"?handleJsonp(a,b,c,e):(g=xhr(),g.open(d,e,!0),setHeaders(g,a),g.onreadystatechange=handleReadyState(g,b,c),a.before&&a.before(g),g.send(f),g)}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function setType(a){var b=a.match(/\.(json|jsonp|html|xml)(\?|$)/);return b?b[1]:"js"}function init(o,fn){function complete(a){o.timeout&&clearTimeout(self.timeout),self.timeout=null,o.complete&&o.complete(a)}function success(resp){var r=resp.responseText;if(r)switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp),o.success&&o.success(resp),complete(resp)}function error(a,b,c){o.error&&o.error(a,b,c),complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout)),this.request=getRequest(o,success,error)}function reqwest(a,b){return new Reqwest(a,b)}function normalize(a){return a?a.replace(/\r?\n/g,"\r\n"):""}function serial(a,b){var c=a.name,d=a.tagName.toLowerCase(),e=function(a){a&&!a.disabled&&b(c,normalize(a.attributes.value&&a.attributes.value.specified?a.value:a.text))};if(a.disabled||!c)return;switch(d){case"input":if(!/reset|button|image|file/i.test(a.type)){var f=/checkbox/i.test(a.type),g=/radio/i.test(a.type),h=a.value;(!f&&!g||a.checked)&&b(c,normalize(f&&h===""?"on":h))}break;case"textarea":b(c,normalize(a.value));break;case"select":if(a.type.toLowerCase()==="select-one")e(a.selectedIndex>=0?a.options[a.selectedIndex]:null);else for(var i=0;a.length&&i<a.length;i++)a.options[i].selected&&e(a.options[i])}}function eachFormElement(){var a=this,b,c,d,e=function(b,c){for(var e=0;e<c.length;e++){var f=b[byTag](c[e]);for(d=0;d<f.length;d++)serial(f[d],a)}};for(c=0;c<arguments.length;c++)b=arguments[c],/input|select|textarea/i.test(b.tagName)&&serial(b,a),e(b,["input","select","textarea"])}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var a={};return eachFormElement.apply(function(b,c){b in a?(a[b]&&!isArray(a[b])&&(a[b]=[a[b]]),a[b].push(c)):a[b]=c},arguments),a}var context=this,win=window,doc=document,old=context.reqwest,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",head=doc[byTag]("head")[0],uniqid=0,lastValue,xmlHttpRequest="XMLHttpRequest",isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},requestedWith:xmlHttpRequest},xhr=win[xmlHttpRequest]?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};return Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serializeArray=function(){var a=[];return eachFormElement.apply(function(b,c){a.push({name:b,value:c})},arguments),a},reqwest.serialize=function(){if(arguments.length===0)return"";var a,b,c=Array.prototype.slice.call(arguments,0);return a=c.pop(),a&&a.nodeType&&c.push(a)&&(a=null),a&&(a=a.type),a=="map"?b=serializeHash:a=="array"?b=reqwest.serializeArray:b=serializeQueryString,b.apply(null,c)},reqwest.toQueryString=function(a){var b="",c,d=encodeURIComponent,e=function(a,c){b+=d(a)+"="+d(c)+"&"};if(isArray(a))for(c=0;a&&c<a.length;c++)e(a[c].name,a[c].value);else for(var f in a){if(!Object.hasOwnProperty.call(a,f))continue;var g=a[f];if(isArray(g))for(c=0;c<g.length;c++)e(f,g[c]);else e(f,a[f])}return b.replace(/&$/,"").replace(/%20/g,"+")},reqwest.compat=function(a,b){return a&&(a.type&&(a.method=a.type)&&delete a.type,a.dataType&&(a.type=a.dataType),a.jsonpCallback&&(a.jsonpCallbackName=a.jsonpCallback)&&delete a.jsonpCallback,a.jsonp&&(a.jsonpCallback=a.jsonp)),new Reqwest(a,b)},reqwest})