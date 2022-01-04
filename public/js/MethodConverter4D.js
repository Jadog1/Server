var outputConsole = { detailedLog: "", variableErrors: [] };
outputConsole.log = function (val) {
    this.detailedLog += new Date().toLocaleTimeString() + " - " + val + "\n";
};
outputConsole.variableLog = function (val, severity = 1) {
    val = "<span class='severe" + severity + "'>" + val + "</span>";
    this.variableErrors.push(val);
};

function varTypes() {
    this.blob = { name: "C_BLOB", arr: [], output: "", initial: "x" };
    this.bool = { name: "C_BOOLEAN", arr: [], output: "", initial: "b" };
    this.collection = { name: "C_COLLECTION", arr: [], output: "", initial: "c" };
    this.date = { name: "C_DATE", arr: [], output: "", initial: "d" };
    this.number = { name: "C_LONGINT", arr: [], output: "", initial: "l" };
    this.obj = { name: "C_OBJECT", arr: [], output: "", initial: "o" };
    this.pict = { name: "C_PICTURE", arr: [], output: "", initial: "pct" };
    this.pict = { name: "C_POINTER", arr: [], output: "", initial: "p" };
    this.real = { name: "C_REAL", arr: [], output: "", initial: "r" };
    this.text = { name: "C_TEXT", arr: [], output: "", initial: "t" };
    this.time = { name: "C_TIME", arr: [], output: "", initial: "h" };
    this.variant = { name: "C_VARIANT", arr: [], output: "", initial: "v" };
}
var interprocess = new varTypes();
var process = new varTypes();
var local = new varTypes();
var gatheredArrays = [];
var headerComments = [];
var otherCode = [];
var parameters = [];
var varTypesAllNames = [];
function loadVarTypesAllNames() {
    var obj = new varTypes();
    for (var variable in obj) {
        variable = obj[variable];
        varTypesAllNames.push(variable.name);
    }
}
loadVarTypesAllNames();

function variableIsParam(string) {
    let bExists = false;
    for (var i = 0; i < parameters.length; i++) {
        if (parameters[i].line.includes(string)) {
            bExists = true;
            break;
        }
    }
    return bExists;
}
function variableIsArray(string) {
    let bExists = false;
    for (var i = 0; i < gatheredArrays.length; i++) {
        if (gatheredArrays[i].includes(string)) {
            bExists = true;
            break;
        }
    }
    return bExists;
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


//Finds unused, potentially undeclared, and incorrectly named variables
function variableAnalysis(textWithoutComments) {
    var allVariablesUsed = [];
    for (var variable in local) {
        variable = local[variable];
        for (var i = 0; i < variable.arr.length; i++) {
            //Find unused variables (Checks listed variables, parameters, and arrays)
            if (textWithoutComments.split(variable.arr[i]).length - 1 == 1)
                outputConsole.variableLog(variable.arr[i] + " is not used anywhere", 2);
            //Find improperly named variables
            if (variable.arr[i].charAt(1) !== variable.initial)
                outputConsole.variableLog(
                    variable.arr[i] + " is not using proper naming"
                );

            allVariablesUsed.push(variable.arr[i]);
        }
    }

    //Find undeclared variables
    var allTypedLocalVars = textWithoutComments.match(/(\$[a-zA-Z0-9]+)/g);
    allTypedLocalVars = allTypedLocalVars.filter(onlyUnique);
    let varExists = false,
        varParam = false,
        varArray = false;
    for (var i = 0; i < allTypedLocalVars.length; i++) {
        variable = allTypedLocalVars[i];
        varExists = allVariablesUsed.indexOf(variable) >= 0;
        varParam = variableIsParam(variable);
        varArray = variableIsArray(variable);
        if (!(varExists || varParam || varArray))
            outputConsole.variableLog(variable + " is not declared", 2);
    }

    outputConsole.variableErrors.sort();
    $("#variableLog").html(outputConsole.variableErrors.join("<br />\n"));
}

function loopThroughGivenVarType(type, typeVariableText) {
    var output = "";
    var hasArrs = false,
        commentIndexOnLine,
        variableArr_VarOutput,
        variableArr_VarComment;
    for (var variable in type) {
        variable = type[variable];
        //console.log(variable);
        if (variable.arr.length != 0) {
            hasArrs = true;
            variable.arr.sort();
            variable.output += variable.name + "(\\\n";

            for (var i = 0; i < variable.arr.length; i++) {
                //Check to see if a variable has a comment. If so, store the comment to be added
                commentIndexOnLine = variable.arr[i].search("//");
                if (commentIndexOnLine != -1) {
                    variableArr_VarOutput = variable.arr[i].substring(
                        0,
                        commentIndexOnLine
                    );
                    variableArr_VarComment = variable.arr[i].substring(
                        commentIndexOnLine,
                        variable.arr[i].length
                    );
                } else {
                    variableArr_VarOutput = variable.arr[i];
                    variableArr_VarComment = "";
                }

                variable.output += variableArr_VarOutput;
                if (i + 1 != variable.arr.length)
                    variable.output += "; \\ " + variableArr_VarComment + "\n";
                //Add end of line for multi-line
                else variable.output += ") " + variableArr_VarComment + "\n\n"; //Add end of line for end of var declaration
            }
            output += variable.output;
            variable.arr.splice(0, variable.arr.length);
            variable.output = "";
        }
    }

    if (hasArrs) output = "//" + typeVariableText + "\n" + output + "\n"; //Display information only if variable type applies
    return output;
}

function loopThroughVarTypes() {
    var output = "",
        i;
    //Set up header
    for (i = 0; i < headerComments.length; i++)
        output += headerComments[i] + "\n";
    if (headerComments.length > 0) output += "\n\n";

    //Set up parameters
    parameters.sort(function (a, b) {
        if (a.param < b.param) return -1;
        else if (a.param > b.param) return 1;
        else return 0;
    });
    for (i = 0; i < parameters.length; i++) output += parameters[i].line + "\n";
    if (parameters.length > 0) output += "\n";

    //Set up variable declaration
    output += loopThroughGivenVarType(local, "Local");
    output += loopThroughGivenVarType(process, "Process");
    output += loopThroughGivenVarType(interprocess, "Interprocess");

    //Set up arrays
    gatheredArrays.sort();
    for (i = 0; i < gatheredArrays.length; i++)
        output += gatheredArrays[i] + "\n\n";

    //Fill in all other code
    for (i = 0; i < otherCode.length; i++) output += otherCode[i] + "\n";

    //Empty out arrays for future use
    gatheredArrays.splice(0, gatheredArrays.length);
    headerComments.splice(0, headerComments.length);
    otherCode.splice(0, otherCode.length);
    parameters.splice(0, parameters.length);

    document.getElementById("output").value = output;
    $("#log").text(outputConsole.detailedLog);
}

function extractLineToVar(
    varGlobalType,
    varAt,
    state,
    splitInput,
    commentOnLine
) {
    var foundVarName = false;
    for (var variable in varGlobalType) {
        variable = varGlobalType[variable];
        var varTypeName = splitInput.substring(0, splitInput.search("\\("));
        if (variable.name === varTypeName || variable.name === state) {
            foundVarName = true;
            variable.arr.push(varAt + commentOnLine);
            break;
        }
    }
    if (!foundVarName) {
        //outputConsole.log("Threw line into otherCode " + splitInput);
        otherCode.push(splitInput);
    }
}

function convert() {
    document.getElementById("output").value = "";
    outputConsole.detailedLog = "";
    outputConsole.variableErrors = [];
    var textWithoutComments = "";
    var foundASplit = false,
        varAt,
        state = "",
        hasHeaderComments = true,
        regex;
    var input = document.getElementById("input").value;
    var splitInput = input.split("\n");
    for (var i = 0; i < splitInput.length; i++) {
        splitInput[i] = splitInput[i].trim();
        try {
        //Load the header comments
        if (hasHeaderComments) {
            if (splitInput[i].trim().startsWith("//")) {
                //outputConsole.log("Adding header to headerComments " + splitInput[i]);
                headerComments.push(splitInput[i]);
                continue;
            } else hasHeaderComments = false;
        }
        //Throw other commented code into otherCode
        if (splitInput[i].trim().startsWith("//")) {
            //outputConsole.log("Threw commented line into otherCode " + splitInput[i]);
            otherCode.push(splitInput[i]);
            continue;
        }

        //Remove comment and add back later
        var commentIndex = splitInput[i].search("//");
        var commentOnLine = splitInput[i].substring(
            commentIndex == -1 ? splitInput[i].length : commentIndex,
            splitInput[i].length
        );
        splitInput[i] = splitInput[i].substring(
            0,
            commentIndex == -1 ? splitInput[i].length : commentIndex
        );
        textWithoutComments += splitInput[i] + "\n";

        //Test if loading an array line
        regex = new RegExp("(array (.+\\(.+\\)))");
        if (regex.test(splitInput[i].toLowerCase())) {
            gatheredArrays.push(splitInput[i]);
            continue;
        }

        //Test if loading a parameter line
        regex = new RegExp("\\$[0-9]+");
        if (regex.test(splitInput[i])) {
            var regexMatchObj = splitInput[i].match(regex);
            parameters.push({
                line: regexMatchObj.input,
                param: parseInt(regexMatchObj[0].substring(1, regexMatchObj[0].length))
            });
            continue;
        }

        //Set varAt if single line variable
        if (
            splitInput[i].search("\\(") != -1 &&
            splitInput[i].search("\\)") != -1 &&
            state == ""
        ) {
            varAt = splitInput[i].substring(
                splitInput[i].search("\\(") + 1,
                splitInput[i].search("\\)")
            );
            //Set varAt if multi-line variable
        } else if (splitInput[i].trim().endsWith("\\") || foundASplit) {
            if (state == "")
                state = splitInput[i].substring(0, splitInput[i].search("\\("));

            if (splitInput[i].search(";") == -1) {
                //Check if last line in multi-line
                varAt = splitInput[i].substring(0, splitInput[i].search("\\)"));
                console.log(varAt);
                if (varAt == "") {
                    var shouldContinue = false; //For cases when the line starts with a \
                    for (var z = 0; z < varTypesAllNames.length; z++)
                        if (splitInput[i].startsWith(varTypesAllNames[z]))
                            shouldContinue = true;
                    if (shouldContinue) {
                        foundASplit = true;
                        outputConsole.log(
                            "Detected line break at beginning of variable init for line " +
                            splitInput[i]
                        );
                        continue;
                    }
                } else foundASplit = false;
            } else {
                //Otherwise process other multi-line variables
                var regex = new RegExp("(C_[a-zA-Z]+)(\\(.+)");
                var regexResult = regex.test(splitInput[i]);
                var indexStartAt = regexResult ? splitInput[i].search("\\(") + 1 : 0; //Checks if first line
                varAt = splitInput[i].substring(
                    indexStartAt,
                    splitInput[i].search(";")
                );
                foundASplit = true;
            }
        }
        //Check if a a newline or unrecognized line of code
        if (varAt == undefined) {
            otherCode.push(splitInput[i] + "\n");
            continue;
        }
        //Check for broken copies of variables (EG: C_LONGINT(C_BOOLEAN($val))) that can happen from bad state logic
        if (state != "") {
            for (var k = 0; k < varTypesAllNames.length; k++) {
                if (varAt.startsWith(varTypesAllNames[k])) {
                    outputConsole.log(
                        "Discrepancy found in variable state, attempting refresh. varAt: " +
                        varAt
                    );
                    state = "";
                    foundASplit = false;
                    i--;
                }
            }
            if (state == "") continue;
        }

        //Check if varAt is multiple variables
        var splitVarAt = varAt.split(";");
            for (var j = 0; j < splitVarAt.length; j++) {
                varAt = splitVarAt[j].trim();
                if (varAt != undefined) {
                    if (varAt[0] === "<") {
                        extractLineToVar(
                            interprocess,
                            varAt,
                            state,
                            splitInput[i],
                            commentOnLine
                        );
                    } else if (varAt[0] == "$") {
                        extractLineToVar(local, varAt, state, splitInput[i], commentOnLine);
                    } else if (varAt[0].match(/[a-z]/i)) {
                        extractLineToVar(process, varAt, state, splitInput[i], commentOnLine);
                    } else {
                        //outputConsole.log("Threw line into otherCode " + splitInput[i]);
                        otherCode.push(splitInput[i]);
                    }

                    if (foundASplit == false && state != "") state = "";
                }
            } 
        } catch (e) {
            otherCode.push(splitInput[i])
            outputConsole.log("Line errored out " + splitInput[i] + " ("+e+")");
        }
    }

    variableAnalysis(textWithoutComments);
    loopThroughVarTypes();
}

function CopyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
        function () {
            console.log("Async: Copying to clipboard was successful!");
            $('#exampleModal').modal('hide');
        },
        function (err) {
            alert("Async: Could not copy text: " + err);
        }
    );
}

function UseMethodText_4D(text) {
    document.getElementById("input").value = text;
    convert();
}

function GetVariableErrors(text) {
    UseMethodText_4D(text);
    $('#ViewVariables').click();
}

