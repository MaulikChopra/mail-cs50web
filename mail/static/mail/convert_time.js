export function convert_from_django_to_JS_datetime(string) {
  `Takes Django string and converts to JS Date object in local time.
      eg= INPUT: Apr 09 2022, 02:01 PM
      OUTPUT: Sat Apr 09 2022 20:44:00 GMT+0530 (India Standard Time)
      `;
  let final = "";
  // prettier-ignore
  let month_list = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  let month = string.substring(0, 3);
  for (const [index, element] of month_list.entries()) {
    if (month.toLowerCase() === element.toLowerCase()) {
      final += index + 1;
    }
  }
  final += "/";
  let day = string.substring(4, 6);
  final += day;
  final += "/";
  let year = string.substring(7, 11);
  final += year;
  final += " ";
  let time = string.substring(13, 18);
  final += time + ":00 ";
  let am_pm = string.substring(19, 21);
  final += am_pm.toUpperCase() + " UTC";
  const datetime = new Date(final);
  return datetime; // object
  // return datetime.toString() STRING
}

export function formatAMPM(date) {
  `takes date object and returns string with time in 12 hr format`;
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
