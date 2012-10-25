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
					var t			= this;
					t.element		= el;
					t.rootElement	= $('<ul>').addClass('jcv-root');
					t.settings		= $.extend({
					nodeTree: undefined,
					currentNodeId: 0,
					options: {}
				}, settings);
					
				t.runValidations();
				t.element.html(t.rootElement);

				t.drawTree(t.settings.nodeTree, t.settings.currentNodeId);
				
				el.find('.jcv-node-item').live('click.columnView', function() {
					t.settings.currentNodeId = $(this).data('id');
					t.rootElement.html('');
					t.drawTree(t.settings.nodeTree, t.settings.currentNodeId);
				});
			},
			
			drawTree: function(tree, currentId) {
				var t = this;
				
				// Find path from root to currentNode
				var path = t.findPath(tree, currentId);
								
				// Convert tree structure to drawing input structure
				var nodes = t.structureNodes(tree, path, currentId);
								
				// Create HTML from structure
				t.drawNodes(nodes, currentId);				
			},
			
			// Structuring data
			structureNodes: function(tree, path, currentId) {
				return this.structureNodesHelper(path, tree, [], currentId);
			},
						
			structureNodesHelper: function(path, tree, nodes, currentId) {
				var copy = path.slice(0);
				var _path = copy.slice(1); // Remove first item
				
				// At current node depth?
				if (path.length) {					
					// Add list of children
					nodes.push(this.structureNodeChildren(tree));
					
					// Next node in path
					var index = path[0];
					
					// Add next column
					this.structureNodesHelper(_path, node.children[index], nodes, currentId);
				} else {
					if (node.id == currentId) {
						// If current node has children (a folder), add them as well
						var children = this.structureNodeChildren(node);
						if (children) 
							nodes.push(children);
					}
				}
				return nodes;
			},
			
			structureNodeChildren: function(node) {
				if (node.children && node.children.constructor.name == 'Array') {
					var nodes = [];
					$.each(node.children, function(_, _node) {
						nodes.push(_node);
					});
					return nodes;
				}
				return undefined;
			},
			
			findPath: function(tree, id) {
				var path = [];
				return this.findPathHelper(id, tree, path);
			},
			
			findPathHelper: function(id, node, path) {
				if (node.id == id) {
					return path.slice(0);
				} else {
					// Not leaf node?
					if (node.children) {
						// Given ID must be within given tree
						if (node.children.constructor.name == 'Array') {
							// Test sub-tree
							for (index in node.children) {
								// Augment path
								var _path = path.slice(0); 
								_path.push(index);
								var returningPath = this.findPathHelper(id, node.children[index], _path.slice(0));
								
								// Found id?
								if (returningPath) 
									return returningPath;
							}
						}
					}
				}				
				return undefined;
			},
			
			
			// Drawing HTML
			
			drawNodes: function(nodes, currentId) {
				for (index in nodes) {
					this.drawColumn(nodes[index], currentId);
				}
			},
			
			drawColumn: function(nodes, currentId) {
				var column = $('<li>').addClass('jcv-column');
				column.appendTo(this.rootElement);
				var ul = $('<ul>').addClass('jcv-column-content');
				for(index in nodes) {
					ul.append(this.drawNode(nodes[index], currentId));
				}
				column.html(ul);
			},
			
			drawNode: function(node, currentId) {
				var li = $('<li>').addClass('jcv-node-item').attr('data-id', node.id);
				if (node.id == currentId)
					li.addClass("active");
					
				li.html($.tmpl(node.tmpl, node.data));
				return li;
			},
			
			// drawNodeFromId: function(id){
			// 	return this.drawNode(this.findNode(id));
			// },
			
			
			runValidations: function() {
				if (!this.element.length) 
					this.throwError("Couldn't find element");
				if (!jQuery.tmpl) 
					this.throwError("Couldn't find jQuery.tmpl plugin");
			},
			
			throwError: function(error) {
				throw new Error('[jQuery.columnView] ' + error);
			}
		};
	};
	
	$.fn.columnView = function(settings) {
		return this.each(function(){
			new methods().init($(this), settings);
		});
	};
})(jQuery);
