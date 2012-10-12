/* jQuery ColumnView Plugin v0.x
 * Author: Andreas Fransson (zykadelic)
 * http://github.com/zykadelic/jquery-columnview
 * 
 * Licensed under the MIT license:
 * http://opensource.org/licenses/mit-license.php
 * 
 * Dependencies:
 * 	jQuery (developed under version 1.8.2)
 * 	jQuery.tmpl
 */

(function($){
	// By wrapping the methods inside of a function, we can get an instance-like behavior
	// without turning this into a widget (thus requiring jQuery UI) .andreas
	var methods = function(){
		return {
			init: function(el, settings){
				var _t = this;
				_t.settings = settings;
				_t._runValidations();
			},
			
			_runValidations: function(){
				// TODO Add validations
			},
			
			_throwError: function(error){
				throw new Error('[jQuery.columnView] ' + error);
			}
		}
	}
	
	
	
	$.fn.columnView = function(options){
		
		// Default settings overriden with specified settings
		var settings = $.extend({
			// TODO Add settings
		}, options);
		
		return this.each(function(){
			new methods().init($(this), settings);
		});
	}
})(jQuery);
