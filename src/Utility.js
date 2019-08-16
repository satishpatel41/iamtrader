
function csvTojs(csv) {
  var lines=csv;//.split(",");
  var result = [];

  var headers = lines[0].split(",");

    

  for(var i=1; i<lines.length; i++) {
    var obj = {};

    var row = lines[i],
      queryIdx = 0,
      startValueIdx = 0,
      idx = 0;

    if (row.trim() === '') { continue; }

    while (idx < row.length) {
      /* if we meet a double quote we skip until the next one */
      var c = row[idx];

      if (c === '"') {
        do { c = row[++idx]; } while (c !== '"' && idx < row.length - 1);
      }

      if (c === ',' || /* handle end of line with no comma */ idx === row.length - 1) {
        /* we've got a value */
        var value = row.substr(startValueIdx, idx - startValueIdx).trim();

        /* skip first double quote */
        if (value[0] === '"') { value = value.substr(1); }
        /* skip last comma */
        if (value[value.length - 1] === ',') { value = value.substr(0, value.length - 1); }
        /* skip last double quote */
        if (value[value.length - 1] === '"') { value = value.substr(0, value.length - 1); }

        var key = headers[queryIdx++];
        obj[key] = value;
        startValueIdx = idx + 1;
      }

      ++idx;
    }

    result.push(obj);
  }
  return result;
}

function getPercentageChange(oldNumber, newNumber){
  var decreaseValue = newNumber - oldNumber;

  return ((decreaseValue / oldNumber) * 100).toFixed(2);
}


Array.prototype.insert = function(i,...rest){
  return this.slice(0,i).concat(rest,this.slice(i));
}


function formatDate(str)
{
    if(String(str).length == 1)
    {
        str ="0"+str;
    }
    return str;
}

Array.prototype.groupBy = function(prop) {
  return this.reduce(function(groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

function getBankNifity(str)
{
  var bnf = "BANKNIFTY";//BANKNIFTY19MAYFUT
  var now = new Date();
  var y = now.getFullYear();
  var y = now.getMonth();
  y = String(y).slice(2,4);
  m =  String(months[now.getMonth()]).slice(0,3);

  return bnf = bnf + y + m +"FUT";
}

function getAllBankNifityOption(str)
{
  var bnf = "BANKNIFTY";//BANKNIFTY19MAYFUT
  var now = new Date();
  var y = now.getFullYear();
  var y = now.getMonth();
  y = String(y).slice(2,4);
  m =  String(months[now.getMonth()]).slice(0,3);

  return bnf = bnf + y + m +"FUT";
}

