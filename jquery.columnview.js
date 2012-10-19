/* jQuery ColumnView Plugin v0.x
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
				var t				= this;
				t.element		= el;
				t.settings	= $.extend({
					nodeTree: undefined,
					currentNodeId: 0,
					options: {}
				}, settings);
				
				t.runValidations();
				
				var ul = $('<ul>').addClass('jcv-node-wrapper');
				var path = t.findPath(t.settings.currentNodeId);
				var nodes = t.structureNodes(path, t.settings.nodeTree, []);
				console.log(nodes);
				// t.element.html(ul.html(nodes));
				
				el.find('.jcv-node-item').on('click.columnView', function(){
					// t.drawNodeFromId($(this).attr('data-id'));
				});
			},
			
			
			// Structuring data
			
			structureNodes: function(path, node, html){
				var t = this;
				var copy = path.slice(0);
				var _path = copy.slice(1); // Remove first item
				var index = path[0];
				html.push(t.structureNodeContent(node));
				if(_path.length){
					html.push(t.structureNodes(_path, node.children[index], html));
				}
				return html;
			},
			
			structureNodeContent: function(node){
				var t = this;
				
				// If this is the root node, draw it's children
				if(node.children && node.children.constructor.name == 'Array'){
					var nodes = [];
					$.each(node.children, function(_, _node){
						nodes.push(_node);
					});
					return nodes;
				}
			},
			
			findPath: function(id, node){
				var t = this;
				var path = [];
				if(!node) node = t.settings.nodeTree;
				return t.findPathHelper(id, node, path);
			},
			
			findPathHelper: function(id, node, path){
				var t = this;
				if(node.id == id){
					return path.slice(0);
				}else{
					if(node.children && node.children.constructor.name == 'Array'){
						for(index in node.children){
							var _path = path.slice(0); // Copy array
							_path.push(index);
							var returningPath = t.findPathHelper(id, node.children[index], _path.slice(0));
							if(returningPath) return returningPath;
						}
					}
				}
			},
			
			
			// Drawing HTML
			
			drawNode: function(node){
				var li = $('<li>').addClass('jcv-node-item').attr('data-id', node.id);
				li.html($.tmpl(node.tmpl, node.data));
				return li;
			},
			
			// drawNodeFromId: function(id){
			// 	return this.drawNode(this.findNode(id));
			// },
			
			
			runValidations: function(){
				if(!this.element.length) this.throwError("Couldn't find element");
				if(!jQuery.tmpl) this.throwError("Couldn't find jQuery.tmpl plugin");
			},
			
			throwError: function(error){
				throw new Error('[jQuery.columnView] ' + error);
			}
		}
	}
	
	
	
	$.fn.columnView = function(settings){
		return this.each(function(){
			new methods().init($(this), settings);
		});
	}
})(jQuery);
