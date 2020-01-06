export function mergeAddedSeriesSubs(org, added) {
  let res = [];
  for (let v of org) {
    if (
      JSON.stringify(v.series.dimensions) === JSON.stringify(added.dimensions)
    ) {
      continue;
    } else {
      res.push({
        dimensions: v.series.dimensions,
        parameter: v.parameter
      });
    }
  }
  res.push(added);
  return res;
}

export function removeTargetSeriesSubs(org, target) {
  let res = [];
  for (let v of org) {
    if (
      JSON.stringify(v.series.dimensions) === JSON.stringify(target.dimensions)
    ) {
      continue;
    } else {
      res.push({
        dimensions: v.series.dimensions,
        parameter: v.parameter
      });
    }
  }
  return res;
}

//for Onboard datafeed
export function granUnitMapping(gran) {
  switch (Number(gran)) {
    case 1:
    case 2:
    case 3:
      return "days";
    case 4:
      return "hours";
    case 5:
      return "minutes";
    case 6:
    case 8:
      return "seconds";
  }
}

export function granUnitToSecond(value, gran) {
  switch (Number(gran)) {
    case 1:
    case 2:
    case 3:
      return value * 86400;
    case 4:
      return value * 3600;
    case 5:
      return value * 60;
    case 6:
    case 8:
      return value;
  }
}

export function secondToGranUnit(value, gran) {
  switch (Number(gran)) {
    case 1:
    case 2:
    case 3:
      return Math.floor(value / 86400);
    case 4:
      return Math.floor(value / 3600);
    case 5:
      return Math.floor(value / 60);
    case 6:
    case 8:
      return value;
  }
}
