      /* for localization */
      var Bundle = srGetStrBundle("chrome://wallet/locale/WalletEditor.properties");
      var manageData = Bundle.GetStringFromName("manageData");
      var schemasHeading = Bundle.GetStringFromName("schemasHeading");
      var valuesHeading = Bundle.GetStringFromName("valuesHeading");
      var synonymsHeading = Bundle.GetStringFromName("synonymsHeading");
      var addCmdLabel = Bundle.GetStringFromName("addCmdLabel");
      var removeCmdLabel = Bundle.GetStringFromName("removeCmdLabel");
      var okCmdLabel = Bundle.GetStringFromName("okCmdLabel");
      var cancelCmdLabel = Bundle.GetStringFromName("cancelCmdLabel");

      /* for xpconnect */
      var walleteditor =
        Components.classes
          ["component://netscape/walleteditor/walleteditor-world"].createInstance();
      walleteditor = walleteditor.QueryInterface(Components.interfaces.nsIWalletEditor);

      function get()
      {
        return walleteditor.GetValue();
      }

      function set(value)
      {
        walleteditor.SetValue(value, window);
      }
      /* end of xpconnect stuff */

      title_frame = 0;
      schema_frame = 1;
      value_frame = 2;
      synonym_frame = 3;
      button_frame = 4;

      var schemas = [];
      var schemasLength;
      var values = [];
      var valuesLength;
      var strings = [];
      var stringsLength;

      var currentSchema=0;
      var currentValue=0;
      var currentSynonym=0;
      var BREAK;

      function generateOutput(button) {
        var i, j, k;
        var output = button + BREAK;
        for (i=0; !(i>=schemasLength); i++) {
          for (j=schemas[i]; !(j>=schemas[i+1]); j++) {
            for (k=values[j]; !(k>=values[j+1]); k++) {
              output += strings[k] + BREAK;
            }
          }
        }

        set(output);
      }

      function parseInput() {
        var input;
        var i, j;
        input = get();

        /* check for user supplying invalid database key */
        if (input.length == 0) {
          flushTables();
          BREAK = '+';
          return false;
        }

        BREAK = input[0];

        flushTables();
        strings = input.split(BREAK);
        stringsLength = strings.length;

        j = 0;
        for (i=1; !(i>=stringsLength); i++) {
          if (strings[i] != "") {
            if(strings[i-1] == "") {
              values[j++] = i;
              valuesLength++;
            }
          }
        }
        values[j] = stringsLength;

        j = 0;
        for (i=0; !(i>=valuesLength); i++) {
          if (i == 0 || (strings[values[i]] != strings[values[i-1]])) {
            schemas[j++] = i;
            schemasLength++;
          }
        }
        schemas[j] = valuesLength;
        return true;
      }

      function dumpStrings() {
        /* for debugging purposes */
        var i, j, k;
        for (i=0; !(i>=schemasLength); i++) {
          dump("<<"+i+" "+schemas[i]+" "+values[schemas[i]]+" "+strings[values[schemas[i]]] +">>\n");
          for (j=schemas[i]; !(j>=schemas[i+1]); j++) {
            dump("<<     " + strings[values[j]+1] +">>\n");
            for (k=values[j]+2; !(k>=values[j+1]-1); k++) {
              dump("<<....." + strings[k] +">>\n");
            }
          }
        }
        dump("\n");
      }

      function dumpRawStrings() {
        /* for debugging purposes */
        var i;
        dump("Schemas follow\n");
        for (i=0; !(i>=schemasLength); i++) {
          dump("{" + schemas[i] + "}");
        }
        dump("[" + schemas[schemasLength] + "]");
        dump("\nValues follow\n");
        for (i=0; !(i>=valuesLength); i++) {
          dump("{" + values[i] + "}");
        }
        dump("[" + values[valuesLength] + "]");
        dump("\nStrings follow\n");
        for (i=0; !(i>=stringsLength); i++) {
          dump("{" + strings[i] + "}");
        }
        dump("\n");
      }

      function lostFocus() {
        schemalist = top.frames[schema_frame].document.schema.schemalist;
        valuelist = top.frames[value_frame].document.value.valuelist;
        synonymlist = top.frames[synonym_frame].document.synonym.synonymlist;

        if (!(schemalist.selectedIndex>=0)) {
          currentSchema = 0;
          currentValue = 0;
          currentSynonym = 0;
          loadMain();
          return;
        } else if (schemalist.selectedIndex != currentSchema) {
          currentSchema = schemalist.selectedIndex;
          currentValue = 0;
          currentSynonym = 0;
          loadMain();
          return;
        }

        if (!(valuelist.selectedIndex>=0)) {
          currentValue = 0;
          currentSynonym = 0;
          loadMain();
          return;
        } else if (valuelist.selectedIndex != currentValue) {
          currentValue = valuelist.selectedIndex;
          currentSynonym = 0;
          loadMain();
          return;
        }

        if (!(synonymlist.selectedIndex>=0)) {
          currentSynonym = 0;
          loadMain();
          return;
        } else if (synonymlist.selectedIndex != currentSynonym) {
          currentSynonym = synonymlist.selectedIndex;
          loadMain();
          return;
        }
      }

      function flushTables() {
          strings[0] = "";
          strings[1] = "";
          values[0] = 0;
          values[1] = 2;
          schemas[0] = 0;
          schemas[1] = 0;
          schemasLength = 0;
          valuesLength = 0;
          stringsLength = 0;
          currentSchema = 0;
          currentValue = 0;
          currentSynonym = 0;
      }

      function deleteSchema0() {
        var i;

        if (schemasLength == 1) {
          flushTables();
          return;
        }

        currentValue = 0;
        numberOfValues = schemas[currentSchema+1] - schemas[currentSchema];
        for (i=0; !(i>=numberOfValues); i++) {
          deleteValue0();
        }

        deleteString(values[schemas[currentSchema]]+1); /* delete blank line */
        deleteString(values[schemas[currentSchema]]); /* delete name of schema */
        valuesLength--;
        for (i=schemas[currentSchema]; !(i>valuesLength); i++) {
          values[i] = values[i+1];
        }
        for (i=0; !(i>schemasLength); i++) {
          if (schemas[i] > valueToDelete) {
            schemas[i]--;
          }
        }

        schemasLength--;
        for (i=currentSchema; !(i>schemasLength); i++) {
          schemas[i] = schemas[i+1];
        }
      }

      function deleteValue0() {
        var i;
        valueToDelete = schemas[currentSchema]+currentValue;
        currentSynonym = 0;
        while (!(values[valueToDelete]+2 >= values[valueToDelete+1]-1)) {
          deleteSynonym0();
        }

        if ((schemas[currentSchema+1] - schemas[currentSchema]) == 1) {
          if(strings[values[valueToDelete]+1] != "") {
            deleteString(values[valueToDelete]+1);
          }
          return;
        }

        while(strings[values[valueToDelete]] != "") {
          deleteString(values[valueToDelete]);
        }
        deleteString(values[valueToDelete]);

        valuesLength--;
        for (i=valueToDelete; !(i>valuesLength); i++) {
          values[i] = values[i+1];
        }

        for (i=0; !(i>schemasLength); i++) {
          if (schemas[i] > valueToDelete) {
            schemas[i]--;
          }
        }
      }

      function deleteSynonym0() {
        stringToDelete = values[schemas[currentSchema]+currentValue]+2+currentSynonym;
        deleteString(stringToDelete);
      }

      function addSchema0() {
        var i;
        text = top.frames[schema_frame].document.schema.newSchema;
        if (text.value == "") {
          return;
        }
        schemaIndex = 0;
        while ((schemaIndex<schemasLength) &&!(strings[values[schemas[schemaIndex]]] >= text.value)) {
          schemaIndex++;
        }

        schemasLength++;
        for (i=schemasLength; i>schemaIndex; i--) {
          schemas[i] = schemas[i-1]+1;
        }

        valueIndex = schemas[schemaIndex];
        valuesLength++;
        for (i=valuesLength; i>valueIndex; i--) {
          values[i] = values[i-1];
        }
        
        stringIndex = values[valueIndex];
        if (stringIndex == stringsLength) {
          stringIndex--;
        }

        addString(stringIndex, text.value);
        addString(stringIndex+1, "");
        schemas[schemaIndex] = valueIndex;
        values[valueIndex] = stringIndex;
      }

      function addValue0() {
        var i;
        text = top.frames[value_frame].document.value.newValue;
        if (text.value == "") {
          return;
        }
        stringIndex = values[schemas[currentSchema]+currentValue];
        if(strings[values[schemas[currentSchema]+currentValue]+1]=="") {
          addString(values[schemas[currentSchema]+currentValue]+1, text.value);
          return;
        }

        addString(stringIndex, strings[values[schemas[currentSchema]]]);
        addString(stringIndex+1, text.value);
        addString(stringIndex+2, "");

        valuesLength++;
        for (i=valuesLength; i>schemas[currentSchema]+currentValue; i--) {
          values[i] = values[i-1];
        }
        values[schemas[currentSchema]+currentValue] = stringIndex;

        for (i=currentSchema+1; !(i>schemasLength); i++) {
          schemas[i]++;
        }
      }

      function addSynonym0() {
        text = top.frames[synonym_frame].document.synonym.newSynonym;
        if (text.value == "") {
          return;
        }
        addString(values[schemas[currentSchema]+currentValue]+2, text.value);
      }

      function deleteString(stringToDelete) {
        var i;
        stringsLength--;
        for (i=stringToDelete; !(i>=stringsLength); i++) {
          strings[i] = strings[i+1];
        }
        for (i=0; !(i>valuesLength); i++) {
          if (values[i] > stringToDelete) {
            values[i]--;
          }
        }
      }

      function addString(stringToAdd, text) {
        var i;
        stringsLength++;
        for (i=stringsLength; i>stringToAdd; i--) {
          strings[i] = strings[i-1];
        }
        strings[stringToAdd] = text;
        for (i=0; !(i>valuesLength); i++) {
          if (values[i] >= stringToAdd) {
            values[i]++;
          }
        }

      }

      function addSchema() {
        addSchema0();
        loadMain();
      }

      function addValue() {
        if (schemasLength != 0) {
          addValue0();
          loadMain();
        }
      }

      function addSynonym() {
        if (schemasLength != 0) {
          addSynonym0();
          loadMain();
        }
      }

      function deleteSchema() {
        deleteSchema0();
        loadMain();
      }

      function deleteValue() {
        deleteValue0();
        loadMain();
      }

      function deleteSynonym() {
        deleteSynonym0();
        loadMain();
      }

      function loadMain() {

        /* create the title */
        top.frames[title_frame].document.open();
        top.frames[title_frame].document.write(
          "<body bgcolor='#cccccc' name='schema'>" +
            "<h3><center><b>" + manageData + "</b></center></h3>" +
          "</body>"
        );
        top.frames[title_frame].document.close();

        /* create the schema list */
        top.frames[schema_frame].document.open();
        top.frames[schema_frame].document.write(
          "<body bgcolor='#cccccc' name='schema'>" +
          "<b>" + schemasHeading + "</b><br>" +
          "<form name='schema'>" +
            "<table border='0' width='50%' bgcolor='#cccccc'>" +
              "<tr>" +
                "<td>" +
//                "<select name='schemalist' size='10' onchange='top.lostFocus();'>"
// (bug 3317 workaround)
                  "<select name='schemalist' size='10' onchange=\"setTimeout('top.lostFocus();',0)\">"
        );
        for (i=0; !(i>=schemasLength); i++) {
          if (i == currentSchema) {
            selected = " selected='selected'";
          } else {
            selected = "";
          }
          top.frames[schema_frame].document.write(
                    "<option" + selected + ">" + strings[values[schemas[i]]] + "</option>"
          );
        }
        top.frames[schema_frame].document.write(
                  "</select>" +
                "</td>" +
              "</tr>" +
              "<tr>" +
                "<td>" +
//                "<button onclick='parent.deleteSchema();'>" + removeCmdLabel + "</button>" +
// (bug 3317 workaround)
                  "<button onclick=\"setTimeout('parent.deleteSchema();',0)\">" + removeCmdLabel + "</button>" +
                "</td>" +
              "</tr>" +
              "<tr>" +
                "<td>" +
                  "<nobr>" +
                    "<input type='text' size='8' name='newSchema'>" +
//                  "<button onclick='parent.addSchema();'>" + addCmdLabel + "</button>" +
// (bug 3317 workaround)
                    "<button onclick=\"setTimeout('parent.addSchema();',0)\">" + addCmdLabel + "</button>" +
                  "</nobr>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</form>" +
          "</body>"
        );
        top.frames[schema_frame].document.close();

        /* create the value list */
        top.frames[value_frame].document.open();
        top.frames[value_frame].document.write(
          "<body bgcolor='#cccccc' name='schema'>" +
          "<b>" + valuesHeading + "</b><br>" +
          "<form name=value>" +
            "<table border='0' width='50%' bgcolor='#cccccc'>" +
              "<tr>" +
                "<td>" +
//                "<select name='valuelist' size='5' onchange='top.lostFocus();'>"
// (bug 3317 workaround)
                  "<select name='valuelist' size='5' onchange=\"setTimeout('top.lostFocus();',0)\">"
        );
        for (i=schemas[currentSchema]; !(i>=schemas[currentSchema+1]); i++) {
          if ((i-schemas[currentSchema]) == currentValue) {
            selected = " selected='selected'";
          } else {
            selected = "";
          }
          if (strings[values[i]+1] != "") {
            top.frames[value_frame].document.write(
                    "<option" + selected + ">" + strings[values[i]+1] + "</option>"
            );
          }
        }
        top.frames[value_frame].document.write(
                  "</select>" +
                "</td>" +
                "<td>" +
//                "<button onclick='parent.deleteValue();'>" + removeCmdLabel + "</button>" +
// (bug 3317 workaround)
                  "<button onclick=\"setTimeout('parent.deleteValue();',0)\">" + removeCmdLabel + "</button>" +
                  "<br/>" +
                  "<nobr>" +
                    "<input type='text' size='8' name='newValue'>" +
//                  "<button onclick='parent.addValue();'>" + addCmdLabel + "</button>" +
// (bug 3317 workaround)
                    "<button onclick=\"setTimeout('parent.addValue();',0)\">" + addCmdLabel + "</button>" +
                  "</nobr>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</form>" +
          "</body>"
        );
        top.frames[value_frame].document.close();

        /* create the synonym list */
        top.frames[synonym_frame].document.open();
        top.frames[synonym_frame].document.write(
          "<body bgcolor='#cccccc' name='schema'>" +
          "<b>" + synonymsHeading + "</b><br>" +
          "<form name=synonym>" +
            "<table border='0' width='50%' bgcolor='#cccccc'>" +
              "<tr>" +
                "<td>" +
//                "<select name='synonymlist' size='3' onchange='top.lostFocus();'>"
// (bug 3317 workaround)
                  "<select name='synonymlist' size='3' onchange=\"setTimeout('top.lostFocus();',0)\">"
        );
        for (i=values[schemas[currentSchema]+currentValue]+2; !(i>=values[schemas[currentSchema]+1]-1); i++) {
          if ((i-(values[schemas[currentSchema]+currentValue]+2)) == currentSynonym) {
            selected = " selected='selected'";
          } else {
            selected = "";
          }
          top.frames[synonym_frame].document.write(
                    "<option" + selected + ">" + strings[i] + "</option>"
          );
        }
        top.frames[synonym_frame].document.write(
                  "</select>" +
                "</td>" +
                "<td>" +
//                "<button onclick='parent.deleteSynonymSchema();'>" + removeCmdLabel + "</button>" +
// (bug 3317 workaround)
                  "<button onclick=\"setTimeout('parent.deleteSynonym();',0)\">" + removeCmdLabel + "</button>" +
                  "<br/>" +
                  "<nobr>" +
                    "<input type='text' size='8' name='newSynonym'>" +
//                  "<button onclick='parent.addSynonym();'>" + addCmdLabel + "</button>" +
// (bug 3317 workaround)
                    "<button onclick=\"setTimeout('parent.addSynonym();',0)\">" + addCmdLabel + "</button>" +
                  "</nobr>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</form>" +
          "</body>"
        );
        top.frames[synonym_frame].document.close();

        /* create the buttons */
        top.frames[button_frame].document.open();
        top.frames[button_frame].document.write(
          "<body bgcolor='#cccccc' name='schema'>" +
            "<hr/>" +
            "<form name=button>" +
              "<div align='right'>" +
                "<button value='OK' onclick='parent.generateOutput(this.value);'>" + okCmdLabel + "</button>" +
                " &nbsp;&nbsp;" +
                "<button value='Cancel' onclick='parent.generateOutput(this.value);'>" + cancelCmdLabel + "</button>" +
              "</div>" +
            "</form>" +
          "</body>"
        );
        top.frames[button_frame].document.close();

      }

      function loadFrames() {
        if (!parseInput()) {
          setTimeout('parent.generateOutput("Cancel")',0);
        } else {
          loadMain();
        }
      }
