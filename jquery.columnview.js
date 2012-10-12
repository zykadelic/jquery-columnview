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
 * 
 * Metaphor:
 * The root "folder" (defined through the `nodes` key) is an Array. Each "file"
 * (end node) is a regular array item in that array, with it's value being it's
 * name. A "folder" is an Object, with the first key being it's name, and it's
 * value as it's contents, defined as an Array. This array works the same way
 * as the root - "files" are regular array items and "subfolders" are another
 * Object. Example:
 * 	nodes: [
 * 		{'Folder 1': [
 * 			{'Subfolder 1': ['File']},
 * 			{'Subfolder 2': [
 * 				'File 1', 'File 2', {'Subsubfolder': ['File 1', 'File 2']}
 * 			]},
 * 			'File'
 * 		]},
 * 		{'Folder 2': [
 * 			{'Subfolder 1': ['File']},
 * 			{'Subfolder 2': ['File 1', 'File 2', 'File 3', 'File 4']}
 * 		]},
 * 		'File'
 * 	]
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
			
			runValidations: function(){
				if(!this.settings.element.length) this.throwError("Couldn't find element");
				// if(!jQuery.tmpl) this.throwError("Couldn't find jQuery.tmpl plugin");
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
