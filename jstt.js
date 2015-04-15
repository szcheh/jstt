'use strict';

function jstt( src ) {
	var block_def = {
		'if': {
			patern : /^\s*if\s+/i,
			need_end :1,
			as_str: function( str )	{
				var res;
				if( res = /^\s*if\s+(.+)\s*$/.exec( str ) ) {
					return "if( "+res[1]+") {\n";
				}
				throw "jtmpl: syntax error: bad IF syntax";
				return '';
			}
		},
		'elsif': {
			patern : /^\s*elsif\s+/i,
			as_str: function( str )	{
				var res;
				if( res = /^\s*elsif\s+(.+)\s*$/.exec( str ) ) {
					return "} else if( "+res[1]+" ) {\n";
				}
				throw "jtmpl: syntax error: bad ELSIF syntax";
				return '';
			}
		},
		'else': {
			patern : /^\s*else\s+/i,
			as_str: function( str )	{
				return "} else {\n";
			}
		},
		'foreach': {
			patern : /^\s*foreach\s+/i,
			need_end :1,
			as_str: function( str )	{
				var res;
				if( res = /^\s*foreach\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s*$/.exec( str ) ) {
					return res[2] +".forEach(function("+res[1] +","+res[3]+"){\n";
				}
				throw "jtmpl: syntax error: bad FOREACH syntax";
				return ''; //throw "syntax error"
			}
		},
		'for': {
			patern : /^\s*for\s+/i,
			need_end :1,
			as_str: function( str )	{
				var res;
				if( res = /^\s*for\s+([^\s]+)\s+in\s+([^\s]+)\s*$/.exec( str ) ) {
					return "for(var "+res[1] +" in "+res[2]+" ){\n";
				}
				throw "jtmpl: syntax error: bad FOR syntax";
				return ''; //throw "syntax error"
			}
		},
		'end': {
			patern : /^\s*end\s*/i,
		},
		'exec': {
			patern : /^\s*exec\s+/i,
			as_str: function( str )	{
				str = str.replace(/^\s*exec\s/i,'');
				return str+"\n";
			}
		},
		'end_for': {
			as_str: function( str )	{
				return "\n}\n";
			}
		},
		'end_if': {
			as_str: function( str )	{
				return "\n}\n";
			}
		},
		'end_foreach': {
			as_str: function( str )	{
				return "\n});\n";
			}
		},
		'var': {
			as_str: function( str )	{
				str = str.replace(/\n/g,"\\n");
				return "$out_str += ("+str+");\n";
			}
		},
		'string': {
			as_str: function( str )	{
				str = str.replace(/\n/g,"\\n");
				str = str.replace(/"/g,'\\"');
				str = str.replace(/'/g,"\\'");
				return "$out_str += '"+str+"';\n";
			}
		}
	};



	// 1. split str to blocks
	var blocks = [];

	var cur_block = {
		str    : '',
		is_cmd :  0
	};

	var ch;
	for(var i=0; i<src.length; i++ ) {
		ch = src.charAt( i );
		switch ( ch ) {
			case '[':
				var next_ch = src.charAt( i+1 );
				if( next_ch == '%' ) {
					i++;
					blocks.push( cur_block ); //end block
					cur_block = { //start new block
						str : '',
						is_cmd: 1
					};
					break;
				}
			case '%':
				var next_ch = src.charAt( i+1 );
				if( next_ch == ']' ) {
					i++;
					blocks.push( cur_block ); //end block
					cur_block = {  //start new block
						str : '',
						is_cmd: 0
					};
					break;
				}
			default:
				cur_block.str += ch;
				break;
		}
	}
	blocks.push( cur_block );

	// 2. define block types & create function body
	var ret;
	var function_body= "ret=function(data){ var x=function(){\nvar $out_str='';\n";

	var need_end_block= new Array();
	blocks.forEach( function( block ) {
		if( block.is_cmd ) {
			for(var type in block_def) {
				if( block_def[type].patern &&  block_def[type].patern.test( block.str ) ) {
					if( type == 'end'  ) {
						if( need_end_block.length == 0) {
							throw "jtmpl: syntax error: too many [% end %]";
						}
						block.type='end_' + need_end_block.pop();
					} else {
						block.type = type;
					}

					if( block_def[type].need_end ) {
						need_end_block.push( block.type );
					}
				}
			};

			if( ! block.type ) {
				block.type = 'var';
			}

		} else {
			block.type = 'string';
		}

		if( !( block.type == 'string' && block.str == '') ) {
			function_body += block_def[block.type].as_str( block.str );
		}
	});

	function_body += "\nreturn $out_str;\n}; return x.call(data);}\n";

	if( need_end_block.length > 0) {
		 throw "jtmpl: syntax error: miss [% end %]";
	}

	// 3. compile function
	try {
		eval(function_body);
	}
	catch(err)
	{
		throw "jtmpl: compile error: "+err;
	}

	return ret;
}
