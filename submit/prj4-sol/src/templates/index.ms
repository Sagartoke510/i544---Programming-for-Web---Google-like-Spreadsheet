<!DOCTYPE html>
<html>
  <head>
    <title>CS 444/544 Spreadsheet Selection</title>
    <link rel="stylesheet" href="/style.css" type="text/css"/>
  </head>
  <body>
    <h1>CS 444/544 Spreadsheet Selection</h1>
    <form action="/" method="POST">
      <label for="ssName">Open Spreadsheet Name</label>
      <span>
	<input name="ssName" value="" id="ssName"/>
	<br/>
	<span class="error" id="ssNameError">
        {{#errors}}
            <p class="error">{{msg}}</p>
        {{/errors}}
    </span>
      </span>
       <input onClick="window.location.href='next.ms'" type="submit" value="Open" />
    </form>
  </body>
</html>
