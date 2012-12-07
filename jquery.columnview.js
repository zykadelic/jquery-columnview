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
	var methods = function() {
		return {
			init: function(el, settings) {
				var t			= this;
				t.settings		= $.extend({
					nodeTree: undefined,
					startNodeId: 0,
					options: {},
					listElement : '<ul>',
					classes: {
						root: 'jcv-root',
						column: 'jcv-column',
						columnContent: 'jcv-column-content',
						node: 'jcv-node-item'
					},
					eventNamespace: 'columnview'
				}, settings);

				t.element		= el;
				t.rootElement	= $(t.settings.listElement).addClass(t.settings.classes.root);
					
				t.runValidations();
				t.element.html(t.rootElement);

				var data = t.drawTree(t.rootElement, t.settings.nodeTree, t.settings.startNodeId);
				t.nodes = data.nodes;
				t.path = data.path;
				
				el.find('.' + t.settings.classes.node).live('click.' + t.settings.eventNamespace, function() {
					newId = $(this).data('id');
					newDepth = $(this).data('depth');
					
					t.rootElement.html('');
					t.updateTree(t.rootElement, t.settings.nodeTree, t.path, t.nodes, newId, newDepth);
				});
			},
			
			updateTree: function(htmlRoot, tree, path, nodes, newId, newDepth) {
				// Update path 
				newPath = path.slice(0, newDepth);

				// Find new parent
				parent = this.findNode(tree, newPath);

				// Update node structure list
				newNodes = nodes.slice(0, newDepth + 1);
				
				// Find new current node
				children = parent.children;
				for (index in children) {
					if (children[index].id == newId) {
						newNode = children[index];
						newPath.push(index);
						break;
					}
				}
							
				callbackArgs = {
					jcv: this,
					root: htmlRoot,
					nodes: newNodes,
					id: newId,
					path: newPath
				};
				
				// Add extra column if parent was folder and selected
				if (newNode.children)
					this.fetchChildren(newNode, this.updateTreeCallback, callbackArgs);
				else
					this.updateTreeCallback(callbackArgs);
			},

			updateTreeCallback: function(args) {
				// Create HTML from structure
				args.jcv.drawNodes(args.root, args.nodes, args.id);
				
				// Save data in this
				args.jcv.nodes = args.nodes;
				args.jcv.path = args.path;				
			},
			
			// In order to support AJAX, this needs to accept a callback. I recommend 
			// using a callback in both cases, and just calling it directly.
			fetchChildren: function(node, cb, cbArgs) {
				if (node.children.constructor.name == 'Array') {
					// Call callback directly
					cbArgs.nodes.push(node.children.slice(0));
					cb(cbArgs);
				} else if (node.children.constructor.name == 'Object') {
					// Fetch via AJAX
					// Callback called asynchrously
					$.ajax({
						type: 'post',
						url: node.children.url,
						data: node.children.data,
						dataType: 'json',
						complete: function(children, status) {
							// Do we need to convert the format in any way?
							if (status == 'success' && children.constructor.name == 'Array')
								cbArgs.nodes.push(children.slice(0));
							
							// Supplied callback
							cb(cbArgs);
						}
					});	
				}
			},
			
			findNode: function(tree, path) {
				if (path.length > 0) {
					// Remove first path index
					var copy = path.slice(0);
					var _path = copy.slice(1);
					var nextParent = tree.children[path[0]];
					
					return this.findNode(nextParent, _path.slice(0));
				} else
					return tree;
			},
			
			drawTree: function(htmlRoot, tree, currentId) {
				// Find path from root to currentNode
				var path = this.findPath(tree, currentId);
				
				// Convert tree structure to drawing input structure
				var nodes = this.structureNodes(tree, path, currentId);
							
				// Create HTML from structure
				this.drawNodes(htmlRoot, nodes, currentId);				
				return {'path': path, 'nodes': nodes};
			},

			// Structuring data
			structureNodes: function(tree, path, currentId) {
				return this.structureNodesHelper(path, tree.children, [], tree.id, currentId);
			},
						
			structureNodesHelper: function(path, nodes, output, parentId, currentId) {
				// Remove first path index
				var copy = path.slice(0);
				var _path = copy.slice(1);
				
				// Have we reached current node?
				if (path.length > 0) {
					output.push(nodes.slice(0));

					var nextParent = nodes[path[0]];
					var nextNodes = nextParent.children;
					
					// Add next column
					this.structureNodesHelper(_path.slice(0), nextNodes, output, nextParent.id, currentId);
				} else {
					// Add extra column if parent was folder and selected
					if (parentId == currentId && nodes && nodes.constructor.name == 'Array')
						output.push(nodes.slice(0));
				}
				return output;
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
			
			drawNodes: function(root, nodes, currentId) {
				for (index in nodes) {
					var column = this.drawColumn(nodes[index], index, currentId);
					column.appendTo(root);
				}
			},
			
			drawColumn: function(columnNodes, depth, currentId) {
				var t = this;
				var column = $('<li>').addClass(t.settings.classes.column);
				var ul = $(t.settings.listElement).addClass(t.settings.classes.columnContent);
				for(index in columnNodes) {
					ul.append(this.drawNode(columnNodes[index], depth, currentId));
				}
				column.html(ul);
				return column;
			},
			
			drawNode: function(node, depth, currentId) {
				var li = $('<li>').addClass(this.settings.classes.node).attr('data-id', node.id).attr('data-depth', depth);
				if (node.id == currentId)
					li.addClass("active");
					
				li.html($.tmpl(node.tmpl, node.data));
				return li;
			},
			
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
