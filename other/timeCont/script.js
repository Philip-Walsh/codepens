BASE_CLASSNAME = "time__container";
let times = {
  exampleid: {
    solarNoon: "2025-03-07T20:05:22.154Z",
    nadir: "2025-03-07T08:05:22.154Z",
    sunrise: "2025-03-07T14:15:10.554Z",
    sunset: "2025-03-08T01:55:33.755Z",
    sunriseEnd: "2025-03-07T14:17:45.738Z",
    sunsetStart: "2025-03-08T01:52:58.571Z",
    dawn: "2025-03-07T13:50:10.193Z",
    dusk: "2025-03-08T02:20:34.115Z",
    nauticalDawn: "2025-03-07T13:21:11.805Z",
    nauticalDusk: "2025-03-08T02:49:32.503Z",
    nightEnd: "2025-03-07T12:52:09.117Z",
    night: "2025-03-08T03:18:35.191Z",
    goldenHourEnd: "2025-03-07T14:48:29.625Z",
    goldenHour: "2025-03-08T01:22:14.683Z",
  },
};
times = {};
const getTimeInTimezone1 = (timezone) => {
  let timeInTimezone =new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  // console.log({timezone},{timeInTimezone});
  return timeInTimezone;
};
const getTimeInTimezone = (timezone) => {
  // let timeInTimezone =new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  let options = {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  },
  formatter = new Intl.DateTimeFormat([], options);
  let timeInTimezone = formatter.format(new Date());
  // console.log({timezone},{timeInTimezone});
  return timeInTimezone;
};

function getTime(timezone) {
  let time1 = getTimeInTimezone1(timezone);
  console.log({time1});
  let time = getTimeInTimezone(timezone);
  console.log({time});
  return [
    time,
    time.toLocaleTimeString("en-US", {
      timeZone: timezone,
    }),
  ];
}
function getTimeComponents(id) {
  let timeParent = document.getElementById(id);
  let timeElement = document.querySelector(`#${id} time`);
  if (!timeParent) {
    timeParent = document.createElement("section");
    timeElement = document.createElement("time");
    timeParent.id = id;
    timeParent.classList.add(BASE_CLASSNAME);
    document.body.appendChild(timeParent);
    timeParent.appendChild(timeElement);
  }
  return [timeParent, timeElement];
}

function getTimeClass(time, timeRanges) {
  console.log({ time });
  const ranges = [
    {
      range: [timeRanges.sunrise, timeRanges.sunriseEnd],
      className: "sunrise",
    },
    {
      range: [timeRanges.sunriseEnd, timeRanges.goldenHourEnd],
      className: "goldenHourEnd",
    },
    {
      range: [timeRanges.goldenHourEnd, timeRanges.solarNoon],
      className: "goldenHourEnd",
    },
    {
      range: [timeRanges.solarNoon, timeRanges.goldenHour],
      className: "solarNoon",
    },
    {
      range: [timeRanges.goldenHour, timeRanges.sunsetStart],
      className: "goldenHour",
    },
    {
      range: [timeRanges.sunsetStart, timeRanges.sunset],
      className: "sunsetStart",
    },
    { range: [timeRanges.sunset, timeRanges.dusk], className: "sunset" },
    { range: [timeRanges.dusk, timeRanges.nauticalDusk], className: "dusk" },
    {
      range: [timeRanges.nauticalDusk, timeRanges.night],
      className: "nauticalDusk",
    },
    { range: [timeRanges.night, timeRanges.nadir], className: "night" },
    { range: [timeRanges.nadir, timeRanges.nightEnd], className: "nadir" },
    {
      range: [timeRanges.nightEnd, timeRanges.nauticalDawn],
      className: "nightEnd",
    },
    {
      range: [timeRanges.nauticalDawn, timeRanges.dawn],
      className: "nauticalDawn",
    },
    { range: [timeRanges.dawn, timeRanges.sunrise], className: "dawn" },
  ];
  for (const { range, className } of ranges) {
    if (time >= range[0] && time < range[1]) {
      console.log(className);
      return `time__${className}`;
    }
  }
}
function updateClassesIfChanged(timeParent, newClassName) {
  let classList = Object.values(timeParent.classList).filter(
    (v) => v !== BASE_CLASSNAME
  );
  if (!(classList.length === 1 && classList[0] === newClassName)) {
    timeParent.className = BASE_CLASSNAME;
    timeParent.classList.add(newClassName);
    console.log("updated");
  }
}

const updateTime = (id, timezone, lat, lon) => {
  console.log(id);
  let [timeParent, timeElement] = getTimeComponents(id);
  let [time, formattedTime] = getTime(timezone);
  console.log(time);
  timeElement.textContent = formattedTime;

  if (!times[id]) {
    times[id] = SunCalc.getTimes(time, lat, lon);
    console.log(times[id]);
  }
  let newClassName = getTimeClass(time, times[id]);

  updateClassesIfChanged(timeParent, newClassName);
};

const addTicker = (id, timezone, lat, lon) => {
  updateTime(id, timezone, lat, lon);
  // setInterval(() => updateTime(id, timezone, lat, lon), 1000);
};

addTicker("indiana", "America/Kentucky/Louisville", 39.7684, -86.1581);
// addTicker("dublin", "Europe/Dublin", 53.3498, -6.2603);
