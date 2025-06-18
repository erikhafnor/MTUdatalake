var CONST_LINK_DETAILED_HELP = "Consult detailed help for more information on this variable";

// Common table that will be used to store, it will contain the row number and the value to be sorted  tableIdSort[x]["groups or source or...];
var tableIdSort = new Array();
var filterValue = "";
var currentHelp;
varInModels = new Array();
var numVarForDisplayPopup = 75;
var isIE = true;
if ("Netscape" == navigator.appName) {
	isIE = false
}
// Popup funcs:
var pgWin = null;
var pgGlobMessage;
var pgGlobTodo;
var pgGlobDone;
var pgGlobStatus;
var pgGlobLoadImages;
var pgGlobTime1;
var pgGlobTime2;

function myPopupGetElement(id) {
	var obj;
	if (pgWin.document.layers) obj = pgWin.document.layers[id];
	else if (pgWin.document.all) obj = pgWin.document.all[id];
	else if (pgWin.document.getElementById) obj = pgWin.document.getElementById(id);
	return obj;
}

function myPopupProgress(percent) {
	if (!isIE) //Firefox tank the popup too... :(
		return;

	try {
		var message = "";
		if (isNaN(parseInt(percent))) {
			message = percent;
			percent = 0;
		}
		var pgSize = 2; // * 100
		var doneWidth = percent * pgSize;
		var todoWidth = (100 - percent) * pgSize;

		if (false == pgWin.closed) {
			pgGlobTodo.width = todoWidth;
			pgGlobDone.width = doneWidth;
			pgGlobTime2 = new Date();
			if (message != "") {
				pgGlobStatus.innerHTML = message;
			} else {
				pgGlobStatus.innerHTML = "" + percent + "%";
			}
		}
	} catch (ex) {
		var noop = ex;
	}
}

function myPopupOpen(theTitle) {
	if (!isIE) //Firefox tank the popup too... :(
		return;
	pgGlobTime1 = new Date();
	var winl = 0;
	var wint = 0;


	var theBodyHeight;
	var theBodyWidth;
	var theBodyTop;
	var theBodyLeft;

	if (isIE) {
		theBodyHeight = document.body.clientHeight;
		theBodyWidth = document.body.clientWidth;
		theBodyTop = window.screenTop;
		theBodyLeft = window.screenLeft;
	} else {
		theBodyHeight = document.body.clientHeight;
		theBodyWidth = document.body.clientWidth;
		theBodyTop = window.screenY;
		theBodyLeft = window.screenX;
	}

	var winl = theBodyLeft + (theBodyWidth - 300) / 2;
	var wint = theBodyTop + (theBodyHeight - 150) / 2;

	pgWin = window.open("",
		"",
		"toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=300,height=150,top=" +
		wint +
		",left=" +
		winl);

	var theContent = new Array();

	theContent.push(
		"<html><head><title>Progress:</title></head><body style=\"margin: 0; background-color: #FFFFFF; height: 50px; font-family:Arial, Helvetica, sans-serif; font-size:x-small; color:#000080\" ><div style=\"height:90px; width:100%\">");
	theContent.push(
		"<br>&nbsp;&nbsp;&nbsp;<b>Loading:</b><br/><br/><div align=\"center\" id=\"pgMessage\">fd</div></div><div align=\"center\" style=\"height:25px; width:100%; border-width: 0px; border-style: solid; vertical-align:middle\">");
	theContent.push(
		"<div id='pgLoadImages' style='border:0'><img src=\"pgborder.gif\" width=\"1\" height=\"15\" border=\"0\"/><img id=\"pgDone\" src=\"pgfullback.gif\" width=\"0\" height=\"15\" border=\"0\"/><img id=\"pgTodo\" src=\"pgemptyback.gif\" width=\"200\" height=\"15\" border=\"0\"/><img src=\"pgborder.gif\" width=\"1\" height=\"15\" border=\"0\"/></div>");
	theContent.push(
		"</div><div style=\"padding: 10px 10px 10px 10px; height:35px; width:100%; color:#333333;background-color: #F7F3F7; border-top-color: #DEDFDE; border-top-style: solid; border-top-width: 1px;text-align: right;vertical-align:middle; \">");
	theContent.push("<div id=\"pgStatus\"></div></div></body></html>");
	try {
		pgWin.document.open();
		pgWin.document.write(theContent.join(""));
		pgWin.document.close();

		pgGlobMessage = myPopupGetElement('pgMessage');
		pgGlobMessage.innerHTML = theTitle;
		pgGlobTodo = myPopupGetElement('pgTodo');
		pgGlobDone = myPopupGetElement('pgDone');
		pgGlobStatus = myPopupGetElement('pgStatus');
		pgGlobLoadImages = myPopupGetElement('pgLoadImages');

		if (pgGlobMessage == null ||
			pgGlobTodo == null ||
			pgGlobDone == null ||
			pgGlobStatus == null ||
			pgGlobMessage == null ||
			pgGlobLoadImages == null) {
			myPopupClose();
		}
	} catch (e) {
		var noop = e;
	}
}

function myPopupClose() {
	if (!isIE) //Firefox tank the popup too... :(
		return;

	try {
		if (false == pgWin.closed) {
			pgWin.close();
			pgWin = null;
		}
	} catch (ex) {
		var noop = ex;
	}
}

//sets the default display to Common Help
function init() {

	// If there is no variables, remove the Variables list from HelpSelect:
	if (varCount == 0) {
		var obj = myGetElement('HelpSelect');
		if (obj) {
			var lastItem = obj.length - 1;
			obj.remove(lastItem);
		}
	}
	// Let's fill the varInModels Table, that will contain varInModels[modelNumber][0] = modelname; varInModels[modelNumber][1] = numofvar; varInModels[modelNumber][1+x] = varuniqueid;
	var nModel = 0;
	modelUsed = new Array();
	modelNames = new Array();
	for (i = 0; i < varArray.length; i++) {
		var currentModel = -1;
		if (modelUsed[varArray[i][CMODEL]] != 1) {
			modelUsed[varArray[i][CMODEL]] = 1;
			varInModels[nModel] = new Array();
			varInModels[nModel][0] = varArray[i][CMODEL]; //Model Name
			varInModels[nModel][1] = 0; //Length
			currentModel = nModel++;
		}
		if (currentModel == -1) {
			for (j = 0; j < varInModels.length; j++) {
				if (varInModels[j][0] == varArray[i][CMODEL]) {
					currentModel = j;
					break;
				}
			}
		}

		var len = varInModels[currentModel][1];

		varInModels[currentModel][2 + len] = varArray[i][CVARCOUNT];
		varInModels[currentModel][1]++;

	}

	currentHelp = 1;
	obj = myGetElement("Help" + currentHelp);
	obj.className = "selected";
	if (varCount != 0) {
		ShowCommonTable("VarListContainer1", CVARID, false);
		ShowCommonHelp("VarListContainer1Help");
	}
}

function myGetElement(id) {
	var obj;
	if (document.layers) obj = document.layers[id];
	else if (document.all) obj = document.all[id];
	else if (document.getElementById) obj = document.getElementById(id);
	return obj;
}

//Quick sort applied on tableIdSort[row_number][value_to_sort] functions
function get(i) {
	var node = tableIdSort[i][1];
	var retval = node;
	if (parseInt(retval) == retval) return parseInt(retval);
	return retval;
}

function compare(val1, val2, desc) {
	return (desc) ? val1 > val2 : val1 < val2;
}

function exchange(i, j) {
	var tempNode = new Array();
	tempNode[0] = tableIdSort[i][0];
	tempNode[1] = tableIdSort[i][1];
	tableIdSort[i][0] = tableIdSort[j][0];
	tableIdSort[i][1] = tableIdSort[j][1];
	tableIdSort[j][0] = tempNode[0];
	tableIdSort[j][1] = tempNode[1];
}

function quicksort(m, n, desc) {
	if (n <= m + 1) return;
	if ((n - m) == 2) {
		if (compare(get(n - 1), get(m), desc)) exchange(n - 1, m);
		return;
	}
	i = m + 1;
	j = n - 1;
	if (compare(get(m), get(i), desc)) exchange(i, m);
	if (compare(get(j), get(m), desc)) exchange(m, j);
	if (compare(get(m), get(i), desc)) exchange(i, m);
	pivot = get(m);
	while (true) {
		j--;
		while (compare(pivot, get(j), desc)) j--;
		i++;
		while (compare(get(i), pivot, desc)) i++;
		if (j <= i) break;
		exchange(i, j);
	}
	exchange(m, j);
	if ((j - m) < (n - j)) {
		quicksort(m, j, desc);
		quicksort(j + 1, n, desc);
	} else {
		quicksort(j + 1, n, desc);
		quicksort(m, j, desc);
	}
}

//Generate tables:
function checkCommonEnter(e) {
	if (e && e.which) {
		characterCode = e.which
	} else {
		e = event;
		characterCode = e.keyCode
	}

	if (characterCode == 13) {
		if (myGetElement('filterText')) {
			filterValue = myGetElement('filterText').value
		}
		ShowCommonTable("VarListContainer1", CVARID, false);
	}
}

// The helpviewer filter ENTER KEYCODE, so we need a button...
function doCommonFilter() {
	if (myGetElement('filterText')) {
		filterValue = myGetElement('filterText').value
	}
	ShowCommonTable("VarListContainer1", CVARID, false);
}

function checkFullEnter(e, divName) {
	if (e && e.which) {
		characterCode = e.which
	} else {
		e = event;
		characterCode = e.keyCode
	}

	if (characterCode == 13) {
		if (myGetElement('filterText')) {
			filterValue = myGetElement('filterText').value
		}
		ShowFullTable(divName, CVARID, false);
	}
}

function doFullFilter(divName) {
	if (myGetElement('filterText')) {
		filterValue = myGetElement('filterText').value
	}
	ShowFullTable(divName, CVARID, false);
}

function FullReset(divName) {
	filterValue = "";
	myGetElement('filterText').value = '';
	ShowFullTable(divName, CVARID, false);
}

function checkDeviceEnter(e, divName, modelName) {
	if (e && e.which) {
		characterCode = e.which
	} else {
		e = event;
		characterCode = e.keyCode
	}

	if (characterCode == 13) {
		if (myGetElement('filterText')) {
			filterValue = myGetElement('filterText').value

		}
		ShowDeviceTable(divName, modelName, CVARID, false);
	}
}

// The helpviewer filter ENTER KEYCODE, so we need a button...
function doDeviceFilter(divName, modelName) {
	if (myGetElement('filterText')) {
		filterValue = myGetElement('filterText').value
	}
	ShowDeviceTable(divName, modelName, CVARID, false);
}

function commonReset() {
	filterValue = "";
	myGetElement('filterText').value = '';
	ShowCommonTable('VarListContainer1', CVARID, false);
}

function DeviceReset(divName, modelName) {
	filterValue = "";
	myGetElement('filterText').value = '';
	ShowDeviceTable(divName, modelName, CVARID, false);
}

function AddRowWithFilter(label) {
	var theReturn = 1;

	var search = "";
	if (filterValue != "") {
		search = filterValue;
		search = search.toUpperCase();
	}

	if (search != "") {
		if (label.match(search) != null) {
			theReturn = 1;
		} else {
			theReturn = 0;
		}
	} else {
		theReturn = 1;
	}

	return theReturn;
}

function ShowCommonHelp(divNameHelp) {
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var indexInTable = new Array();
	var tableCounter = 0;
	for (i = 0; i < varArray.length; i++) {
		if (varArray[i][CISCOMMON] == 1 && indexInTable[varArray[i][CVARID]] != 1) {
			indexInTable[varArray[i][CVARID]] = 1;
			tableIdSort[tableCounter] = [varArray[i][CVARCOUNT], varArray[i][CVARID]];
			tableCounter++;
		}
	}

	var theContent = new Array();
	// If we've got something to sort...
	if (tableIdSort.length >= 0) {
		//Common Section addition:
		var commonSecCount = 0;
		var commonSecArray = new Array();

		quicksort(0, tableIdSort.length, false);
		for (i = 0; i < tableIdSort.length; i++) {
			var detHelp = myGetElement('HelpDetDesc' + tableIdSort[i][0]);
			if (detHelp) {
				theContent.push("<a name=\"VarDetDesc" + tableIdSort[i][0] + "\"></a>");
				theContent.push("<p class=\"titleText\">Variable " + tableIdSort[i][1] + "</p>");
				theContent.push("<span class=\"text\">" + detHelp.innerHTML + "</span>");
			}

			// Check if a common section is needed by this variable.
			if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
				var commonSecCurrent = varArray[tableIdSort[i][0]][CCOMMONSECTION];
				var commonSecFound = 0;

				//Check if the common section is already in the list
				for (j = 0; j < commonSecCount; j++) {
					if (commonSecArray[j] != null && commonSecArray[j][0] == commonSecCurrent) {
						//We've found the common section in the list, just add the Variable in the list:
						commonSecArray[j][1] = commonSecArray[j][1] + ", " + varArray[tableIdSort[i][0]][CVARID];
						commonSecFound = 1;
						break;
					}
				}

				if (commonSecFound == 0) {
					//The Common sec needs to be added:
					commonSecArray[commonSecCount] = new Array(commonSecCurrent,
						"Variable(s): " + varArray[tableIdSort[i][0]][CVARID]);
					commonSecCount++;
				}
			}
		}

		// Put the Common section in the HTML
		for (j = 0; j < commonSecCount; j++) {
			var commonSecHelp = myGetElement('HelpCommonSec' + commonSecArray[j][0]);
			if (commonSecHelp) {
				theContent.push("<a name=\"HelpCommon" + commonSecArray[j][0] + "\"></a>");
				theContent.push("<p class=\"titleText\">" + commonSecArray[j][1] + "</p>");
				theContent.push("<span class=\"text\">" + commonSecHelp.innerHTML + "</span>");
			}
		}

		if (theContent.length > 0) {
			// Add section header
			theContent.splice(0, 0, "<br/><a name='Detailed common variables help'/>");
			theContent.splice(1,
				0,
				"<table border=\"0\" cellpadding=\"0\" cellspacing=\"1px\" height=\"25px\" class=\"tableTitle\">");
			theContent.splice(2,
				0,
				"<tbody><tr><td valign=\"bottom\" class=\"titleText \">Detailed Common Variables Description</td></tr></tbody></table>");
			// Add section footer
			theContent.push("<br/><div class=\"backToTopLink\">");
			theContent.push("<a href=\"#Top\">Back to top</a>");
			theContent.push("</div>");
		}

		var obj = myGetElement(divNameHelp);
		if (obj) {
			obj.innerHTML = theContent.join("");
		}
	}
}

function ShowCommonTable(divName, CColToSort, DESC) {
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var indexInTable = new Array();
	var tableCounter = 0;
	for (i = 0; i < varArray.length; i++) {
		if (varArray[i][CISCOMMON] == 1 &&
			indexInTable[varArray[i][CISALARM] + varArray[i][CVARID]] != 1 &&
			AddRowWithFilter(varArray[i][CLABEL].toUpperCase()) == 1) {
			indexInTable[varArray[i][CISALARM] + varArray[i][CVARID]] = 1;
			tableIdSort[tableCounter] = [varArray[i][CVARCOUNT], varArray[i][CColToSort]];
			tableCounter++;
		}
	}

	var theContent = new Array();

	// If we've got something to sort...
	if (tableIdSort.length >= 0) {

		obj = myGetElement(divName);

		if (obj) {
			if (tableIdSort.length >= numVarForDisplayPopup) {
				myPopupOpen("Creating Common Var List. <br/>(" + tableIdSort.length + " Variables.)");
				myPopupProgress("Sorting variables...");
			}
			quicksort(0, tableIdSort.length, DESC);

			theContent.push("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">");
			theContent.push("<tr>");
			theContent.push("<td width=\"50%\">");
			theContent.push("<span class=\"text\">");
			theContent.push(
				"Filter Labels: <input type=\"text\" id=\"filterText\" onkeypress=\"javascript:checkCommonEnter(event)\" size=\"40\" value=\"" +
				filterValue +
				"\" style='vertical-align:middle'/>");
			theContent.push(
				"&#160;<input type='button' onclick='doCommonFilter()' value='Search' style='vertical-align:middle'/>&#160;<input type='button' onclick='commonReset()'value='Reset' style='vertical-align:middle'/>");
			theContent.push("</span>");
			theContent.push("</td>");
			theContent.push("<td width=\"20%\">");
			theContent.push("</td>");
			theContent.push("</tr>");
			theContent.push("</table>");
			theContent.push("<br/>");

			// We start by building the header table
			var order = "false";
			var image = "";
			theContent.push(
				"<table class='tableClassicList' cellspacing='0' cellpadding='2' id='tableVarListContainer1'>");
			theContent.push("<thead>");
			theContent.push("<tr>");

			// Choose arrow
			if (CColToSort == CVARID) {
				if (DESC) {
					order = "false";
					image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
				} else {
					order = "true";
					image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
				}
			}
			theContent.push(
				"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowCommonTable( \"" +
				divName +
				"\", CVARID, " +
				order +
				");'>ID" +
				image +
				"</div></td>");
			order = "false";
			image = "";

			if (CColToSort == CLABEL) {
				if (DESC) {
					order = "false";
					image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
				} else {
					order = "true";
					image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
				}
			}
			theContent.push(
				"<td class='tableHeaderCellBorder' width='30%'><div width='100%' class='activeObj' onclick='ShowCommonTable( \"" +
				divName +
				"\", CLABEL, " +
				order +
				");'>Label" +
				image +
				"</div></td>");
			order = "false";
			image = "";

			if (CColToSort == CUNITID) {
				if (DESC) {
					order = "false";
					image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
				} else {
					order = "true";
					image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
				}
			}
			theContent.push(
				"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowCommonTable( \"" +
				divName +
				"\", CUNITID, " +
				order +
				");'>Unit" +
				image +
				"</div></td>");
			order = "false";
			image = "";

			theContent.push("<td class='tableHeaderCellBorder' width='60%'><span >Description</span></td>");
			theContent.push("</tr>");
			theContent.push("</thead>");
			theContent.push("<tbody>");

			// Then we put each row (already sorted) in the table
			var altern = false;
			var tableLength = tableIdSort.length;

			for (i = 0; i < tableLength; i++) {
				if (tableLength >= numVarForDisplayPopup) {
					myPopupProgress(parseInt((i * 100) / tableLength));
				}

				if (!altern)
					theContent.push("<tr>");
				else
					theContent.push("<tr bgcolor='#eeeeee'>");

				// Retrieve detailleddescription presence
				var detHelpHere = false;
				var objDetHelp = myGetElement('HelpDetDesc' + tableIdSort[i][0]);
				if (objDetHelp) {
					detHelpHere = true;
				}

				var varIdMessage = varArray[tableIdSort[i][0]][CVARID];
				if (detHelpHere) {
					varIdMessage = "<a href='#VarDetDesc" +
						tableIdSort[i][0] +
						"'>" +
						varArray[tableIdSort[i][0]][CVARID] +
						"</a>";
				} else if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
					varIdMessage = "<a href='#HelpCommon" +
						varArray[tableIdSort[i][0]][CCOMMONSECTION] +
						"'>" +
						varArray[tableIdSort[i][0]][CVARID] +
						"</a>";
				}

				theContent.push("<td class='tableCellBorder' width='5%'>" + varIdMessage + "</td>");
				theContent.push("<td class='tableCellBorder' width='20%'>" +
					varArray[tableIdSort[i][0]][CLABEL] +
					"</td>");
				theContent.push("<td class='tableCellBorder' width='5%'>" +
					GetUnitDescriptionStretched(varArray[tableIdSort[i][0]][CUNITID]) +
					"</td>");

				// Retrieve description
				var help = "";
				var objHelp = myGetElement('HelpDesc' + tableIdSort[i][0]);
				if (objHelp) {
					help = objHelp.innerHTML;
				}
				if (objDetHelp) {
					help = help +
						"<br/><br/><a href='#VarDetDesc" +
						tableIdSort[i][0] +
						"'>" +
						CONST_LINK_DETAILED_HELP +
						"</a>";
				}
				if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
					help = help +
						"<br/><br/><a href='#HelpCommon" +
						varArray[tableIdSort[i][0]][CCOMMONSECTION] +
						"'>" +
						CONST_LINK_DETAILED_HELP +
						"</a>";
				}
				theContent.push("<td class='tableCellBorder' align='left' width='40%'>" + help + "&nbsp;</td>");

				theContent.push("</tr>");

				//We change the altern bool
				altern = !altern;
			}

			//We close the table...
			theContent.push("</tbody>");
			theContent.push("</table>");
			theContent.push("<br/><div class=\"backToTopLink\">");
			theContent.push("<a href=\"#Top\">Back to top</a>");
			theContent.push("</div>");
			obj.innerHTML = theContent.join("");
			myPopupClose();
		}
	}
}

function ShowDeviceHelp(divNameHelp, modelName) {
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var tableCounter = 0;

	// First we retrieve the var in the model instead of going through all the variables:
	var currentModel = -1;
	for (i = 0; i < varInModels.length; i++) {
		if (varInModels[i][0] == modelName) {
			currentModel = i;
			break;
		}
	}

	if (!varInModels[currentModel])
		return;

	for (i = 0; i < varInModels[currentModel][1]; i++) {
		var varUId = varInModels[currentModel][2 + i];

		tableIdSort[tableCounter] = [varArray[varUId][CVARCOUNT], varArray[varUId][CVARID]];
		tableCounter++;
	}

	var theContent = new Array();
	// If we've got something to sort...
	if (tableIdSort.length >= 0) {
		//Common Section addition:
		var commonSecCount = 0;
		var commonSecArray = new Array();

		quicksort(0, tableIdSort.length, false);
		for (i = 0; i < tableIdSort.length; i++) {
			var detHelp = myGetElement('HelpDetDesc' + tableIdSort[i][0]);
			if (detHelp) {
				theContent.push("<a name=\"VarDetDesc" + tableIdSort[i][0] + "\"></a>");

				var isCommon = "";
				if (varArray[tableIdSort[i][0]][CISCOMMON] == 1) {
					isCommon = " (Common)";
				}

				theContent.push("<p class=\"titleText\">Variable " + tableIdSort[i][1] + isCommon + "</p>");
				theContent.push("<span class=\"text\">" + detHelp.innerHTML + "</span>");
			}


			// Check if a common section is needed by this variable.
			if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
				var commonSecCurrent = varArray[tableIdSort[i][0]][CCOMMONSECTION];
				var commonSecFound = 0;

				//Check if the common section is already in the list
				for (j = 0; j < commonSecCount; j++) {
					if (commonSecArray[j] != null && commonSecArray[j][0] == commonSecCurrent) {
						//We've found the common section in the list, just add the Variable in the list:
						commonSecArray[j][1] = commonSecArray[j][1] + ", " + varArray[tableIdSort[i][0]][CVARID];
						commonSecFound = 1;
						break;
					}
				}

				if (commonSecFound == 0) {
					//The Common sec needs to be added:
					commonSecArray[commonSecCount] = new Array(commonSecCurrent,
						"Variable(s): " + varArray[tableIdSort[i][0]][CVARID]);
					commonSecCount++;
				}
			}
		}

		// Put the Common section in the HTML
		if (commonSecCount > 0) {
			for (j = 0; j < commonSecCount; j++) {
				var commonSecHelp = myGetElement('HelpCommonSec' + commonSecArray[j][0]);
				if (commonSecHelp) {
					theContent.push("<a name=\"HelpCommon" + commonSecArray[j][0] + "\"></a>");
					theContent.push("<p class=\"titleText\">" + commonSecArray[j][1] + "</p>");
					theContent.push("<span class=\"text\">" + commonSecHelp.innerHTML + "</span>");
				}
			}
		}

		if (theContent.length > 0) {
			theContent.splice(0, 0, "<br/><a name='" + modelName + "Detailed Variables Description'/>");
			theContent.splice(1,
				0,
				"<table border=\"0\" cellpadding=\"0\" cellspacing=\"1px\" height=\"25px\" class=\"tableTitle\">");
			theContent.splice(2,
				0,
				"<tbody><tr><td class=\"titleText\">Detailed Variables Description</td></tr></tbody></table>");

			theContent.push("<br/><div class=\"backToTopLink\">");
			theContent.push("<a href=\"#Top\">Back to top</a>");
			theContent.push("</div>");
		}

		var obj = myGetElement(divNameHelp);
		if (obj) {
			obj.innerHTML = theContent.join("");
		}
	}
}

function ShowDeviceTable(divName, modelName, CColToSort, DESC) {
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var tableCounter = 0;

	// First we retrieve the var in the model instead of going through all the variables:
	var currentModel = -1;
	for (i = 0; i < varInModels.length; i++) {
		if (varInModels[i][0] == modelName) {
			currentModel = i;
			break;
		}
	}

	// If this model has variables:
	if (!varInModels[currentModel]) {
		var obj = myGetElement(divName);

		if (obj) {
			obj.innerHTML =
				"<span class='text' style='width:100%; text-align:center'><font color='red'><b>This device has no variable</b></font></span>";
		}
		return;
	}

	for (i = 0; i < varInModels[currentModel][1]; i++) {
		var varUId = varInModels[currentModel][2 + i]
		if (filterValue == "") {
			tableIdSort[tableCounter] = [varArray[varUId][CVARCOUNT], varArray[varUId][CColToSort]];
			tableCounter++;
		} else {
			if (AddRowWithFilter(varArray[varUId][CLABEL].toUpperCase()) == 1) {
				tableIdSort[tableCounter] = [varArray[varUId][CVARCOUNT], varArray[varUId][CColToSort]];
				tableCounter++;
			}
		}
	}

	// If we've got something to sort...
	if (tableIdSort.length >= 0) {
		if (tableIdSort.length >= numVarForDisplayPopup) {
			myPopupOpen("Creating Variables List for: " + modelName + " <br/>(" + tableIdSort.length + " Variables)");
			myPopupProgress("Sorting variables...");
		}
		quicksort(0, tableIdSort.length, DESC);

		obj = myGetElement(divName);
		var theContent = new Array();

		theContent.push("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">");
		theContent.push("<tr>");
		theContent.push("<td width=\"50%\">");
		theContent.push("<span class=\"text\">");
		theContent.push(
			"Filter Labels: <input type=\"text\" id=\"filterText\" onkeypress=\"javascript:checkDeviceEnter(event, '" +
			divName +
			"', '" +
			modelName +
			"')\" size=\"40\" value=\"" +
			filterValue +
			"\" style='vertical-align:middle'/>");
		theContent.push("&#160;<input type='button' onclick=\"doDeviceFilter('" +
			divName +
			"', '" +
			modelName +
			"')\" value='Search' style='vertical-align:middle'/>&#160;<input type='button' onclick=\"DeviceReset('" +
			divName +
			"', '" +
			modelName +
			"')\"value='Reset' style='vertical-align:middle'/>");
		theContent.push("</span>");
		theContent.push("</td>");
		theContent.push("<td width=\"20%\">");
		theContent.push("</td>");
		theContent.push("</tr>");
		theContent.push("</table>");
		theContent.push("<br/>");

		// We start by building the header table
		var order = "false";
		var image = "";
		theContent.push("<table class='tableClassicList' cellspacing='0' cellpadding='2' id='table" + divName + "'>");
		theContent.push("<thead>");
		theContent.push("<tr>");

		// Choose arrow
		if (CColToSort == CVARID) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='5%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CVARID, " +
			order +
			");'>ID" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CLABEL) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='15%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CLABEL, " +
			order +
			");'>Label" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CUNITID) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CUNITID, " +
			order +
			");'>Unit" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		theContent.push("<td class='tableHeaderCellBorder' width='30%'><span >Description</span></td>");

		if (CColToSort == CTYPE) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CTYPE, " +
			order +
			");'>Type" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CGROUP) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CGROUP, " +
			order +
			");'>Group" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CISCOMMON) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CISCOMMON, " +
			order +
			");'>Device" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CSOURCE) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellNoBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowDeviceTable( \"" +
			divName +
			"\", \"" +
			modelName +
			"\", CSOURCE, " +
			order +
			");'>Source" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		theContent.push("</tr>");
		theContent.push("</thead>");
		theContent.push("<tbody>");

		// Then we put each row (already sorted) in the table
		var altern = false;
		var tableLength = tableIdSort.length;

		for (i = 0; i < tableLength; i++) {
			if (tableLength >= numVarForDisplayPopup)
				myPopupProgress(parseInt((i * 100) / tableLength));

			if (!altern)
				theContent.push("<tr>");
			else
				theContent.push("<tr bgcolor='#eeeeee'>");

			// Retrieve detailleddescription presence
			var detHelpHere = false;
			var objDetHelp = myGetElement('HelpDetDesc' + tableIdSort[i][0]);
			if (objDetHelp) {
				detHelpHere = true;
			}

			var varIdMessage = varArray[tableIdSort[i][0]][CVARID];
			if (detHelpHere) {
				varIdMessage = "<a href='#VarDetDesc" +
					tableIdSort[i][0] +
					"'>" +
					varArray[tableIdSort[i][0]][CVARID] +
					"</a>";
			} else if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
				varIdMessage = "<a href='#HelpCommon" +
					varArray[tableIdSort[i][0]][CCOMMONSECTION] +
					"'>" +
					varArray[tableIdSort[i][0]][CVARID] +
					"</a>";
			}
			theContent.push("<td class='CB'>" + varIdMessage + "</td>");
			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CLABEL] + "</td>");
			theContent.push("<td class='CB'>" +
				GetUnitDescriptionStretched(varArray[tableIdSort[i][0]][CUNITID]) +
				"</td>");

			// Retrieve description
			var help = "";
			var objHelp = myGetElement('HelpDesc' + tableIdSort[i][0]);
			if (objHelp) {
				help = objHelp.innerHTML;
			}
			if (objDetHelp) {
				help = help +
					"<br/><br/><a href='#VarDetDesc" +
					tableIdSort[i][0] +
					"'>" +
					CONST_LINK_DETAILED_HELP +
					"</a>";
			}
			if (varArray[tableIdSort[i][0]][CCOMMONSECTION] != "") {
				help = help +
					"<br/><br/><a href='#HelpCommon" +
					varArray[tableIdSort[i][0]][CCOMMONSECTION] +
					"'>" +
					CONST_LINK_DETAILED_HELP +
					"</a>";
			}
			theContent.push("<td class='CB'>" + help + "&nbsp;</td>");

			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CTYPE] + "&nbsp;</td>");
			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CGROUP] + "&nbsp;</td>");

			var device = varArray[tableIdSort[i][0]][CMODEL];
			if (varArray[tableIdSort[i][0]][CISCOMMON] == 1) {
				device = "Common";
			}
			theContent.push("<td class='CB'>" + device + "&nbsp;</td>");
			theContent.push("<td class='tableCellNoBorder'>" + varArray[tableIdSort[i][0]][CSOURCE] + "&nbsp;</td>");

			theContent.push("</tr>");

			//We change the altern bool
			altern = !altern;
		}
		//We close the table...
		theContent.push("</tbody>");
		theContent.push("</table>");
		theContent.push("<br/><div class=\"backToTopLink\">");
		theContent.push("<a href=\"#Top\">Back to top</a>");
		theContent.push("</div>");
		obj.innerHTML = theContent.join("");
	}
	myPopupClose();
}

function ShowFullTable(divName, CColToSort, DESC) {
	var sortCost = 0;
	var displayCost = 0;
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var tableCounter = 0;
	for (i = 0; i < varArray.length; i++) {
		if (AddRowWithFilter(varArray[i][CLABEL].toUpperCase()) == 1) {
			tableIdSort[tableCounter] = [varArray[i][CVARCOUNT], varArray[i][CColToSort]];
			tableCounter++;
		}
	}

	var theContent = new Array();

	// If we've got something to sort...
	if (tableIdSort.length >= 0) {
		if (tableIdSort.length >= numVarForDisplayPopup) {
			myPopupOpen("Creating full variables list. <br/>(" + tableIdSort.length + " Variables)");
			myPopupProgress("Sorting variables...");
		}

		quicksort(0, tableIdSort.length, DESC);

		obj = myGetElement(divName);

		theContent.push("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">");
		theContent.push("<tr>");
		theContent.push("<td width=\"50%\">");
		theContent.push("<span class=\"text\">");
		theContent.push(
			"Filter Labels: <input type=\"text\" id=\"filterText\" onkeypress=\"javascript:checkFullEnter(event, '" +
			divName +
			"')\" size=\"40\" value=\"" +
			filterValue +
			"\" style='vertical-align:middle'/>");
		theContent.push("&#160;<input type='button' onclick=\"doFullFilter('" +
			divName +
			"')\" value='Search' style='vertical-align:middle'/>&#160;<input type='button' onclick=\"FullReset('" +
			divName +
			"')\" value='Reset' style='vertical-align:middle'/>");
		theContent.push("</span>");
		theContent.push("</td>");
		theContent.push("<td width=\"20%\">");
		theContent.push("</td>");
		theContent.push("</tr>");
		theContent.push("</table>");
		theContent.push("<br/>");

		// We start by building the header table
		var order = "false";
		var image = "";
		theContent.push("<table class='tableClassicList' cellspacing='0' cellpadding='2' id='table" + divName + "'>");
		theContent.push("<thead>");
		theContent.push("<tr>");

		if (CColToSort == CVARID) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='5%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CVARID, " +
			order +
			");'>ID" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CLABEL) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='15%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CLABEL, " +
			order +
			");'>Label" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CUNITID) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CUNITID, " +
			order +
			");'>Unit" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		theContent.push("<td class='tableHeaderCellBorder' width='30%'><span >Description</span></td>");

		if (CColToSort == CTYPE) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CTYPE, " +
			order +
			");'>Type" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CGROUP) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CGROUP, " +
			order +
			");'>Group" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CMODEL) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CMODEL, " +
			order +
			");'>Device" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		if (CColToSort == CSOURCE) {
			if (DESC) {
				order = "false";
				image = "&nbsp;&nbsp;<img src='sortup.gif'' class='activeObj' />";
			} else {
				order = "true";
				image = "&nbsp;&nbsp;<img src='sortdown.gif'' class='activeObj' />";
			}
		}
		theContent.push(
			"<td class='tableHeaderCellNoBorder' width='10%'><div width='100%' class='activeObj' onclick='ShowFullTable( \"" +
			divName +
			"\", CSOURCE, " +
			order +
			");'>Source" +
			image +
			"</div></td>");
		order = "false";
		image = "";

		theContent.push("</tr>");
		theContent.push("</thead>");
		theContent.push("<tbody>");

		// Then we put each row (already sorted) in the table
		var altern = false;
		var tableLength = tableIdSort.length;
		for (i = 0; i < tableLength; i++) {
			if (tableLength >= numVarForDisplayPopup)
				myPopupProgress(parseInt((i * 100) / tableLength));

			if (!altern)
				theContent.push("<tr>");
			else
				theContent.push("<tr bgcolor='#eeeeee'>");

			// Retrieve detailleddescription presence

			var varIdMessage = varArray[tableIdSort[i][0]][CVARID];

			theContent.push("<td class='CB'>" + varIdMessage + "</td>");
			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CLABEL] + "</td>");
			theContent.push("<td class='CB'>" +
				GetUnitDescriptionStretched(varArray[tableIdSort[i][0]][CUNITID]) +
				"</td>");

			// Retrieve description
			var help = "";
			var objHelp = myGetElement('HelpDesc' + tableIdSort[i][0]);
			if (objHelp) {
				help = objHelp.innerHTML;
			}

			theContent.push("<td class='CB'>" + help + "&nbsp;</td>");
			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CTYPE] + "&nbsp;</td>");
			theContent.push("<td class='CB'>" + varArray[tableIdSort[i][0]][CGROUP] + "&nbsp;</td>");

			var device = varArray[tableIdSort[i][0]][CMODEL];
			if (varArray[tableIdSort[i][0]][CISCOMMON] == 1) {
				device = device + " (Common)";
			}
			theContent.push("<td class='CB'>" + device + "&nbsp;</td>");
			theContent.push("<td class='tableCellNoBorder'>" + varArray[tableIdSort[i][0]][CSOURCE] + "&nbsp;</td>");

			theContent.push("</tr>");

			//We change the altern bool
			altern = !altern;
		}

		//We close the table...
		theContent.push("</tbody>");
		theContent.push("</table>");
		theContent.push("<br/><div class=\"backToTopLink\">");
		theContent.push("<a href=\"#Top\">Back to top</a>");
		theContent.push("</div>");

		obj.innerHTML = theContent.join("");
	}

	myPopupClose();
}

function ShowFullHelp(divNameHelp) {
	// We start by selecting the row that will be needed, and the column in these rows that will be used to sort
	tableIdSort = new Array();
	var tableCounter = 0;
	var nModel = 0;
	modelUsed = new Array();
	modelNames = new Array();
	for (i = 0; i < varArray.length; i++) {
		if (modelUsed[varArray[i][CMODEL]] != 1) {
			modelUsed[varArray[i][CMODEL]] = 1;
			modelNames[nModel] = varArray[i][CMODEL];
			nModel++;
		}
		tableIdSort[tableCounter] = [varArray[i][CVARCOUNT], varArray[i][CVARID]];
		tableCounter++;
	}

	var theContent = new Array();
	/*
	// If we've got something to sort...
	if( tableIdSort.length >= 0 )
	{
		quicksort(0, tableIdSort.length, false);

		// From here we've got an array sorted by
		for( modelCounter = 0; modelCounter < nModel; modelCounter++)
		{
			var needIntro = 1;
			for( i=0; i<tableIdSort.length; i++)
			{
				if( varArray[ tableIdSort[i][0] ][CMODEL] == modelNames[ modelCounter ] )
				{
					var detHelp = myGetElement( 'HelpDetDesc'+tableIdSort[i][0] );
					if( detHelp )
					{
						if( needIntro == 1 )
						{
							theContent.push("<br/><br/><table border=\"0\" cellpadding=\"0\" cellspacing=\"1px\" height=\"25px\" class=\"tableTitle\">");
							theContent.push("<tbody><tr><td class=\"titleText\">Detailed Variables Description for "+modelNames[ modelCounter ]+" device.</td></tr></tbody></table>");
							needIntro = 0;
						}

						theContent.push("<a name=\"VarDetDesc"+tableIdSort[i][0]+"\"></a>");

						var isCommon = "";
						if( varArray[ tableIdSort[i][0] ][CISCOMMON] == 1 )
							isCommon = " (Common)";
						theContent.push("<p class=\"titleText\">Variable "+tableIdSort[i][1]+isCommon+"</p>");
						theContent.push("<span class=\"text\">"+detHelp.innerHTML+"</span>");
					}
				}
			}
			if( needIntro == 0 )
			{
				theContent.push("<br><div class=\"backToTopLink\">");
				theContent.push("<a href=\"#Top\">Back to top</a>");
				theContent.push("</div>");
			}
		}

		var obj = myGetElement( divNameHelp );
		if( obj )
		{
			obj.innerHTML = theContent.join("");
		}
	}
	*/
}

function DisplayHelp(selectedIndex, selectedName, selectBoxLength) {
	document.body.style.cursor = "wait";


	filterValue = "";
	var divName = "VarListContainer" + (selectedIndex + 1);
	var tableToShow = selectedName;

	//Show table
	var Container = myGetElement(divName);
	if (Container && varCount != 0) {
		Container.innerHTML = tableToShow;

		if (selectedIndex == 0) //Common
		{
			ShowCommonTable(divName, CVARID, false);
			ShowCommonHelp(divName + "Help");
		} else if (selectedIndex == selectBoxLength - 1) //AllVariable
		{
			ShowFullTable(divName, CVARID, false);
			ShowFullHelp(divName + "Help");
		} else // Specific
		{
			ShowDeviceTable(divName, tableToShow, CVARID, false);
			ShowDeviceHelp(divName + "Help", tableToShow);
		}
	}

	divName = "VarListContainer" + (currentHelp);
	//Empty table
	var obj = myGetElement(divName);
	if (obj) {
		obj.innerHTML = "";
	}

	obj = myGetElement(divName + "Help");
	if (obj) {
		obj.innerHTML = "";
	}

	var obj = myGetElement("Help" + currentHelp);
	obj.className = "unselected";
	currentHelp = selectedIndex + 1;

	obj = myGetElement("Help" + (currentHelp));
	obj.className = "selected";
	document.body.style.cursor = "auto";
}

//Get Unit description:
function GetUnitDescriptionStretched(value) {
	var unitMapping = new Array();
	//%STRETCHED_DESCRIPTION_DYNAMIC_CONTENT%
	if (value >= 0 && value < unitMapping.length) {
		return unitMapping[value];
	} else {
		return "Not Available";
	}
}