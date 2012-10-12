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
	// without turning this into a widget (and the need of jQuery UI) .andreas
	var methods = function(){
		return {
			init: function(el, settings){
				this.settings = settings;
				this.rootElement = $('<ul>');
				this.settings.element.html(this.rootElement);
				this.runValidations();
				this.drawNodes(this.settings.nodes, this.rootElement);
			},
			
			drawNodes: function(nodes, list){
				var _t = this;
				if(nodes.constructor === Object){
					for(var key in nodes){
						var li = _t.drawNodeItem(list, key);
						_t.drawNodes(nodes[key], $('<ul>').appendTo(li));
					}
				}
				else if(nodes.constructor === Array){
					for(var i in nodes){
						_t.drawNodes(nodes[i], list);
					}
				}
				else if(nodes.constructor === String){
					_t.drawNodeItem(list, nodes)
				}
			},
			
			drawNodeItem: function(list, text){
				return $('<li>').text(text).appendTo(list);
			},
			
			_runValidations: function(){
				// TODO Add validations
				if(!jQuery.tmpl) this._throwError("Couldn't find jQuery.tmpl plugin");
			},
			
			throwError: function(error){
				throw new Error('[jQuery.columnView] ' + error);
			}
		}
	}
	
	
	
	$.fn.columnView = function(options){
		// Default settings overriden with specified settings
		var settings = $.extend({
			element: undefined,
			nodes: []
		}, options);
		
		return this.each(function(){
			new methods().init($(this), settings);
		});
	}
})(jQuery);
