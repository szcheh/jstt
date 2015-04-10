# jstt
JS Template processing system like perl Template::Tollkit

##Big example
```
<body>
		<!-- Friend Template -->
		<script type="jstt" id="friend_template">
			<b>[% this.name %] - [% this.age %]</b>
			[% if this.sex == 'm' %]
				male
			[% elsif this.sex == 'f' %]
				female
			[% else %]
				?
			[% end %]
		</script>

		<!-- Friends list Template -->
		<script type="jstt" id="test_template">
			Hello, [% this.name %] [% this.method('xxxxx') %]!<br>
			My friends ([% this.friends.length %]):<br/>
			[% foreach friend this.friends indx %]
				[% indx+1 %]. [% friend_template( friend ) %] ( sex:[% friend.sex||'?' %] ) [% friend.notexist||'?' %] <br/>
			[% end %]
			same for:<br/>
			[% for indx in this.friends %]
				[%exec var friend = this.friends[indx] %]
				[% indx+1 %]. [% friend_template( friend ) %] ( sex:[% friend.sex||'?' %] ) [% friend.notexist||'?' %] <br/>
			[% end %]

		</script>


		<script>
			var test_template_str   = document.getElementById("test_template").innerHTML;
			var friend_template_str = document.getElementById("friend_template").innerHTML;

			//Compiling templates
			var friend_template =  jstt( friend_template_str );
			var test_template   =  jstt( test_template_str   );

			var SomeObject ={
				name:'Olo',
				friends:[
						{ name:'Yep',  age:20, sex:'m' },
						{ name:'Zep',  age:25, sex:'m' },
						{ name:"Koko", age:43, sex:'f' }
				],
				method: function( str )
				{
					return "<b>"+str+"<b>";
				}
			};

			var res = test_template( SomeObject	);

			document.write( res );
		</script>

	</body>

```

##Template syntax

####VARS
*example:*
```
[% myvar || '' %]

[% function(arg1,arg3,argn) || 0 %]

[% firstname || name || login || id %]
```

####EXEC
*exec some js code without output*
*example:*
```
[% exec function(arg1,arg3,arg4) %]

[% exec
	if( var == 0 )
	{
		somefunc();
	}
%]
````

####IF .. ELSIF .. ELSE
work like JS if( name){...} else if(login){ ...} else {...}
*example:*
```
[% if name %]
	<div>[% name %]</div>
[% else %]
	<div>[% login %]</div>
[% end %]
```
or
```
[% if firstname %]
	[% firstname %]
[% elsif name %]
	[% name %]
[% elsif login %]
	[% login %]
[% else %]
	[% id %]
[% end %]
```

####FOR
work like JS for( i in array ){...};

*example:*
```
[% FOR i IN array %]
	[% i %] - [% array[i] %]
[% END %]

[% FOR prop IN object %]
	[% prop %] = [% object[prop] %]
[% END %]
```

####FOREACH
work like JS array.forEach(function(item,index){...});

*example:*
```
[% FOREACH item array index %]
	[% index+1 %]. [% item.name %]
[% END %]
```
