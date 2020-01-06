import {
  TimeHelper
} from "@/common/TimeHelper.js";
import {DimensionHelper} from "@/common/DimensionHelper.js";
export class Line {
  emptyReplacement = "<-Allup->";
  tsIdx = -1;
  valIdx = -1;
  expIdx = -1;
  anomalyIdx = -1;
  trendIdx = -1;
  trendChgIdx = -1;
  trendChgIgnoreIdx = -1;
  meanIdx = -1;
  stdIdx = -1;
  periodIdx = -1;
  // predictIdx = -1;
  predictScoreIdx = -1;
  predictValIdx = -1;
  rsSuppressAnomalyIdx = -1;
  rsExpValIdx = -1;
  rsHolidayInfoIdx = -1;
  upIdx = -1;
  downIdx = -1

  constructor(line, indexs, gran, customGran) {
    this.indexs = indexs;
    this.line = line;
    this.gran = gran;
    this.customGran = customGran;
    this.tsIdx = line.columns.indexOf("time");
    this.valIdx = line.columns.indexOf("__VAL__");
    this.expIdx = line.columns.indexOf("__FIELD__.ExpectedValue");
    
    this.anomalyIdx = line.columns.indexOf("__FIELD__.IsAnomaly");
    this.trendChgIdx = line.columns.indexOf("__FIELD__.TrendChangeAnnotate");
    this.trendChgIgnoreIdx = line.columns.indexOf("__FIELD__.TrendChangeAnnotateIgnore");
    this.meanIdx = line.columns.indexOf("__FIELD__.Mean");
    this.stdIdx = line.columns.indexOf("__FIELD__.STD");
    this.periodIdx = line.columns.indexOf("__FIELD__.Period");
    this.costIdx = line.columns.indexOf("__FIELD__.CostPoint");
    this.upperIdx = line.columns.indexOf("__FIELD__.UpperMargin")
    this.lowerIdx = line.columns.indexOf("__FIELD__.LowerMargin")
    // this.predictIdx = line.columns.indexOf("__FIELD__.Prediction");
    this.predictScoreIdx = line.columns.indexOf(
      "__FIELD__.PredictionModelScore"
    );
    this.predictValIdx = line.columns.indexOf("__FIELD__.PredictionValue");
    this.rsSuppressAnomalyIdx = line.columns.indexOf("__FIELD__.RichSignalSuppressAnomaly");
    this.rsExpValIdx = line.columns.indexOf("__FIELD__.RichSignalExpectedValue");
    this.rsHolidayInfoIdx = line.columns.indexOf("__FIELD__.RichSignalHolidayInfo");
  }

  isOutlier() {
    return this.line.id.isOutlier;
  }
  calculateDeltaBySpike(exp, sensitivity, point) {
    let sy = (100 - sensitivity) / 100;
    let delta1 = (2.5 + 10 * sy) * point[this.stdIdx];
    let delta2 = point[meanIdx] * sy * 0.382;
    if (delta2 < 0) {
      delta2 = -delta2;
    }
    return delta1 > delta2 ? delta1 : delta2;
  }

  calculateDelta(exp, sensitivity, point) {
    if (point[this.upperIdx] == -2.0) {
      return 0;
    } else {
      let multiplier = [0, 0.5, 0.8, 1.2, 1.8, 2.5, 3.3, 5, 7, 10, 100];
      let sy = (100 - sensitivity) / 100;

      /*
      let std = point[this.stdIdx];
      std = (std != null && std < Math.abs(exp) * sy) ? std : Math.abs(exp) * sy;
      let delta = std * (1 + multiplier[Math.floor(sy * 10)]);
      */
      let delta = Math.abs(exp) * sy * (1 + multiplier[Math.floor(sy * 10)]);
      return delta;
    }
  }

  adjustAnomaly(tunning, point, line, currentIdx) {
    let exp = point[this.expIdx];
    let upmargin = point[this.upperIdx];
    let downmargin = point[this.lowerIdx];

    return {
      result: point[this.anomalyIdx] ? 1 : 0, 
      upper: exp + upmargin, 
      lower: exp - downmargin
    };

    if (
      !point ||
      (tunning.anomalyDetectorType !== "ChangeThreshold" &&
        tunning.anomalyDetectorType !== "HardThreshold" &&
        point[this.expIdx] == null)
    ) {
      return {
        result: false,
        upper: null,
        lower: null
      };
    }

    if (tunning.anomalyDetectorType === "HardThreshold") {
      if (
        tunning.upperBound * 1.0 >= tunning.lowerBound * 1.0 &&
        ((tunning.anomalyDetectorDirection !== 2 && tunning.anomalyDetectorDirection !== "Pos" &&
            point[this.valIdx] * 1.0 < tunning.lowerBound * 1.0) ||
          (tunning.anomalyDetectorDirection !== 1 && tunning.anomalyDetectorDirection !== "Neg" && 
            point[this.valIdx] * 1.0 > tunning.upperBound * 1.0))
      ) {
        return {
          result: 1,
          upper: null,
          lower: null
        };
      } else {
        return {
          result: 0,
          upper: null,
          lower: null
        };
      }
    }
    // For change threshold
    else if (tunning.anomalyDetectorType === "ChangeThreshold") {
      for (let i = currentIdx - 1; i >= 0; i--) {
        if (line.points[i] && line.points[i][this.valIdx]) {
          let percentage = 
            (line.points[i][this.valIdx] - point[this.valIdx]) /
            line.points[i][this.valIdx]
          ;
          if (Math.abs(percentage) * 100 > tunning.changePercentage) {
            if ((percentage > 0 && tunning.anomalyDetectorDirection !== 2 && tunning.anomalyDetectorDirection !== "Pos") 
                || (percentage < 0 && tunning.anomalyDetectorDirection !== 1 && tunning.anomalyDetectorDirection !== "Neg") ) {
                  return {
                    result: 1,
                    upper: null,
                    lower: null
                  };
                } else {
                  return {
                    result: 0,
                    upper: null,
                    lower: null
                  };
              }
          } else {
            return {
              result: 0,
              upper: null,
              lower: null
            };
          }
        } else if (line.points[i] && line.points[i][this.valIdx] === 0) {
          return {
            result: 0,
            upper: null,
            lower: null
          };
        }
      }

      return {
        result: 0,
        upper: null,
        lower: null
      };
    } else {
      let exp = point[this.expIdx];
      if (point[this.rsExpValIdx] != null) {
        exp = point[this.rsExpValIdx];
      }
      let upper = 0;
      let lower = 0;
      let anomaly = point[this.anomalyIdx] ? 1 : 0;
      if (exp == null) {
        exp = point[this.valIdx];
      }
      // Calculate first round
      upper = exp + this.calculateDelta(exp, tunning.sensitivity, point);
      lower = exp - this.calculateDelta(exp, tunning.sensitivity, point);

      if (0 === anomaly) {
        if (exp > point[this.valIdx] && point[this.valIdx] < lower) {
          exp =
            point[this.valIdx] +
            this.calculateDelta(
              point[this.valIdx],
              100 - (100 - tunning.sensitivity) / 2,
              point
            );

          // Tentative
          anomaly = -1;
        } else if (exp < point[this.valIdx] && point[this.valIdx] > upper) {
          // Tentive
          anomaly = -1

          exp =
            point[this.valIdx] -
            this.calculateDelta(
              point[this.valIdx],
              100 - (100 - tunning.sensitivity) / 2,
              point
            );

        }

        upper = exp + this.calculateDelta(exp, tunning.sensitivity, point);
        lower = exp - this.calculateDelta(exp, tunning.sensitivity, point);
      }

      // Hacking for SR. 
      if (point[this.upperIdx] == -2.0) {
        return {
          result: (point[this.lowerIdx] > (100 - tunning.sensitivity)) ? 1 : 0,
          upper: upper,
          lower: lower
        };
      }

      if (0 === anomaly) {
        return {
          result: 0,
          upper: upper,
          lower: lower
        };
      }

      if (exp !== null) {

        if (upper >= point[this.valIdx] && lower <= point[this.valIdx]) {
          return {
            result: 0,
            upper: upper,
            lower: lower
          };
        } else if (
          upper < point[this.valIdx] &&
          (tunning.anomalyDetectorDirection === 1 || tunning.anomalyDetectorDirection == "Neg")
        ) {
          return {
            result: 0,
            upper: upper,
            lower: lower
          };
        } else if (
          lower > point[this.valIdx] &&
          (tunning.anomalyDetectorDirection === 2 || tunning.anomalyDetectorDirection == "Pos")
        ) {
          return {
            result: 0,
            upper: upper,
            lower: lower
          };
        } else {
          return {
            result: anomaly,
            upper: upper,
            lower: lower
          };
        }
      } else {
        return {
          result: anomaly,
          upper: null,
          lower: null
        };
      }
    }
  }

  getIdLegend() {
    let id = this.line["id"];
    if (!id) {
      return "";
    }
    let vals = [];
    for (let name in id.dimensions) {      
      vals.push(
        DimensionHelper.getDimensionDisplayValueWithGlobal(id.dimensions[name])
      );
    }

    return vals.join(" | ");
  }
  getLineSampledData() {
    let ret = [];
    let pos = 0;
    if (this.gran == "Hourly" || this.gran == "Custom") {
      for (let idx = 0; idx < this.indexs.length;) {
        if (pos === this.line.points.length) {
          break;
        }
        if (
          this.line.points[pos] &&
          this.indexs[idx] ===
          this.transferDate(this.line.points[pos][this.tsIdx])
        ) {
          ret.push({
            value: this.line.points[pos][this.valIdx],
            fields: null,
            line: this
          });
          idx++;
          pos += 1;
        } else if (
          this.transferDate(this.line.points[pos][this.tsIdx]) >
          this.indexs[idx]
        ) {
          ret.push(null);
          idx += 1;
        } else {
          pos += 1;
        }
      }
    } else {}
    return ret;
  }
  getLineData() {
    let ret = [];
    let pos = 0;
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    /*
    for (let i = 0; i < this.line.points.length; i++) {
      if (this.line.points[i][this.valIdx] != null) {
        max =
          max < this.line.points[i][this.valIdx]
            ? this.line.points[i][this.valIdx]
            : max;
        min =
          min > this.line.points[i][this.valIdx]
            ? this.line.points[i][this.valIdx]
            : min;
      }
    }
    */
    return {
      data: this.line.points,
      max: max,
      min: min
    };
  }

  getPrediction() {
    let ret = [];
    let pos = 0;
    for (let idx = 0; idx < this.indexs.length; idx++) {
      if (
        this.indexs[idx] ===
        this.transferDate(this.line.points[pos][this.tsIdx])
      ) {
        if (this.line.points[pos] && this.predictValIdx >= 0) {
          ret.push(this.line.points[pos][this.valIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getLineMeanData() {
    let ret = [];
    let pos = 0;
    for (let idx = 0; idx < this.indexs.length; idx++) {
      if (
        this.indexs[idx] ===
        this.transferDate(this.line.points[pos][this.tsIdx])
      ) {
        if (this.line.points[pos] && meanIdx >= 0) {
          ret.push(this.line.points[pos][this.meanIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getLinePredictionData(full = false) {
    let ret = {
      value: [],
      upper: [],
      lower: []
    };
    let never = true;
    for (let pos = 0; pos < this.line.points.length; pos++) {
      if (pos < this.line.points.length) {
        if (
          this.line.points[pos] &&
          this.predictValIdx >= 0 &&
          this.predictScoreIdx >= 0
        ) {
          if (never) {
            if (this.line.points[pos][this.valIdx] === null && ret.length > 0) {
              never = false;
            }
          }

          let val = this.line.points[pos][this.predictScoreIdx];
          // val -=  (100 - val) / 2;
          ret.value.push([
            this.line.points[pos][this.tsIdx],
            this.line.points[pos][this.predictValIdx]
          ]);
          if ((full || this.line.points[pos][this.valIdx] === null) && never) {
            let predictValue = this.line.points[pos][this.predictValIdx];
            if (this.line.points[pos][this.predictValIdx] > 0) {
              ret.upper.push([
                this.line.points[pos][this.tsIdx],
                predictValue === null ? null :
                (((100 - val) * 2.0) / 100.0) * predictValue
              ]);
              ret.lower.push([
                this.line.points[pos][this.tsIdx],
                predictValue === null ? null :
                (1 - ((100 - val) * 1.0) / 100.0) *
                predictValue
              ]);
            } else {
              ret.upper.push([
                this.line.points[pos][this.tsIdx],
                predictValue === null ? null :
                (((100 - val) * 2.0) / 100.0) *
                Math.abs(predictValue)
              ]);
              ret.lower.push([
                this.line.points[pos][this.tsIdx],
                predictValue === null ? null :
                (1 + ((100 - val) * 1.0) / 100.0) *
                predictValue
              ]);
            }
          } else {
            ret.upper.push([this.line.points[pos][this.tsIdx], null]);
            ret.lower.push([this.line.points[pos][this.tsIdx], null]);
          }
        } else {
          if (never) {
            ret.value[ret.value.length - 1] = [
              this.line.points[pos][this.tsIdx],
              null
            ];
            ret.upper[ret.upper.length - 1] = [
              this.line.points[pos][this.tsIdx],
              null
            ];
            ret.lower[ret.lower.length - 1] = [
              this.line.points[pos][this.tsIdx],
              null
            ];
          }
          ret.value.push([
            this.line.points[pos][this.tsIdx],
            this.line.points[pos][this.valIdx]
          ]);
          ret.upper.push([this.line.points[pos][this.tsIdx], 0]);
          ret.lower.push([
            this.line.points[pos][this.tsIdx],
            this.line.points[pos][this.valIdx]
          ]);
        }
      } else {
        ret.value.push([this.line.points[pos][this.tsIdx], null]);
        ret.upper.push([this.line.points[pos][this.tsIdx], null]);
        ret.lower.push([this.line.points[pos][this.tsIdx], null]);
      }
    }

    return ret;
  }

  getLineMonthOffsetData(month) {
    let ret = [];
    let pos = 0;

    for (let idx = 0; idx < this.indexs.length; idx++) {
      let d = new Date(this.line.points[pos][this.tsIdx]);
      d.setUTCFullYear(d.getMonth() + month);
      if (this.indexs[idx] === this.transferDate(d)) {
        if (this.line.points[pos] && this.valIdx >= 0) {
          ret.push(this.line.points[pos][this.valIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getLineYearOffsetData(year) {
    let ret = [];
    let pos = 0;

    for (let idx = 0; idx < this.indexs.length; idx++) {
      let d = new Date(this.line.points[pos][this.tsIdx]);
      d.setUTCFullYear(d.getUTCFullYear() + year);
      if (this.indexs[idx] === this.transferDate(d)) {
        if (
          this.line.points[pos] &&
          this.line.points[pos][this.valIdx] != null
        ) {
          ret.push(this.line.points[pos][this.valIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getLineDayOffsetData(day) {
    let ret = [];
    for (let pos = 0; pos < this.line.points.length; pos++) {
      if (this.line.points[pos] === undefined) {
        continue;
      }
      let d = this.transferDate(
        this.line.points[pos][this.tsIdx],
        86400000 * day
      );
      ret.push([d, this.line.points[pos][this.valIdx]]);
    }

    return ret;
  }

  getLineWeekOffsetData(week) {
    let ret = [];
    for (let pos = 0; pos < this.line.points.length; pos++) {
      if (this.line.points[pos] === undefined) {
        continue;
      }
      let d = this.transferDate(
        this.line.points[pos][this.tsIdx],
        604800000 * week
      );

      if (
        d >
        this.transferDate(
          this.line.points[this.line.points.length - 1][this.tsIdx]
        )
      ) {
        break;
      }
      ret.push([d, this.line.points[pos][this.valIdx]]);
    }

    return ret;
  }

  getLineSTDData() {
    let ret = [];
    let pos = 0;
    for (let idx = 0; idx < this.indexs.length; idx++) {
      if (
        this.indexs[idx] ===
        this.transferDate(this.line.points[pos][this.tsIdx])
      ) {
        if (this.line.points[pos] && this.stdIdx >= 0) {
          ret.push(this.line.points[pos][this.stdIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getLineTrendData() {
    let ret = [];
    let pos = 0;
    for (let idx = 0; idx < this.indexs.length; idx++) {
      if (
        this.indexs[idx] ===
        this.transferDate(this.line.points[pos][this.tsIdx])
      ) {
        if (this.line.points[pos] && this.expIdx >= 0) {
          ret.push(this.line.points[pos][this.expIdx]);
        } else {
          ret.push(null);
        }

        pos += 1;
      } else {
        ret.push(null);
      }
    }

    return ret;
  }

  getMeanTrendLine(meanTrend, highlightTS) {
    let highD = this.transferDate(new Date(highlightTS));
    let ret = [];
    let pos = 0;
    let startPos = pos;
    let windowSize = meanTrend.length;
    let trend = meanTrend.slice();

    for (let idx = 0; idx < this.line.points.length; idx++) {
      if (highD === new Date(this.line.points[idx][this.tsIdx]).getTime()) {
        startPos = idx;
      }
      ret.push(null);
    }

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let tmp = this.line.points;
    let endPos = startPos - windowSize > 0 ? startPos - windowSize : 0;
   
    for (let idx = startPos; idx > endPos; idx--) {
      min =
        tmp[idx] && min > tmp[idx][this.valIdx] && tmp[idx][this.valIdx] != null
          ? tmp[idx][this.valIdx]
          : min;
      max =
        tmp[idx] && max < tmp[idx][this.valIdx] && tmp[idx][this.valIdx] != null
          ? tmp[idx][this.valIdx]
          : max;
    }
   
    trend.reverse();
    for (let idx = startPos, trendIdx = 0; idx > endPos; idx--, trendIdx++) {
      if (max != min) {
        ret[idx] = [tmp[idx][this.tsIdx], min + trend[trendIdx] * (max - min)];
      } else {
        if (min === 0) {
          ret[idx] = [tmp[idx][this.tsIdx], , trend[trendIdx]]
        } else {
          ret[idx] = [tmp[idx][this.tsIdx], , min * trend[trendIdx]]
        }
      }

    }
    return ret;
  }

  getHightlightMark(highlightTS, isOutlier) {
    let ret = [];
    let pos = 0;

    let highD = this.transferDate(new Date(highlightTS));
    for (let idx = 0; idx < this.indexs.length;) {
      if (pos >= this.line.points.length) {
        break;
      }
      if (
        this.line.points[pos] &&
        new Date(this.indexs[idx]).getTime() ===
        this.transferDate(this.line.points[pos][this.tsIdx])
      ) {
        if (highD === new Date(this.indexs[idx]).getTime()) {
          ret.push({
            coord: [this.indexs[idx], this.line.points[pos][this.valIdx]],
            value: this.line.points[pos][this.valIdx],
            symbol: "arrow",
            symbolSize: 30,
            itemStyle: isOutlier ?
              {
                normal: {
                  color: "#B55"
                }
              } :
              {
                normal: {
                  color: "green"
                }
              }
          });
          break;
        }
        idx += 1;
        pos += 1;
      } else if (
        this.transferDate(this.line.points[pos][this.tsIdx]) > this.indexs[idx]
      ) {
        idx += 1;
      } else {
        pos += 1;
      }
    }
    return {
      mark: ret
    };
  }

  getMarkData(
    tunningParamter,
    highlightTS = null,
    sampled = false,
    sampleStep = 0
  ) {
    let upper = [];
    let lower = [];
    let original = [];
    let ret = [];
    let pos = 0;

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let highD = new Date(highlightTS).getTime();
    if (!sampled || sampleStep == 0 || !highlightTS) {
      original = this.line.points;
    }
    for (let pos = 0; pos < this.line.points.length; pos++) {
      if (this.line.points[pos][this.tsIdx]) {
        if (sampled && sampleStep > 0 && highlightTS) {
          let ts = new Date(this.line.points[pos][this.tsIdx]).getTime();
          if ((ts - highD) % (sampleStep * 1000) != 0) {
            continue;
          }
          original.push(this.line.points[pos]);
        }
        /* 
        max =
        (this.line.points[pos][this.valIdx] != null && max < this.line.points[pos][this.valIdx])
            ? this.line.points[pos][this.valIdx]
            : max;
        min =
        (this.line.points[pos][this.valIdx] != null && min > this.line.points[pos][this.valIdx])
            ? this.line.points[pos][this.valIdx]
            : min;
        */
        if (this.line.points[pos][this.valIdx] != null && pos == this.line.points.length - 1) {
          // Last point
          ret.push({
            coord: [
              this.line.points[pos][this.tsIdx],
              this.line.points[pos][this.valIdx]
            ],
            value: this.line.points[pos][this.valIdx],
            symbolSize: 10,
            symbol: "pin",
            itemStyle: {
              normal: {
                color: "green"
              }
            },
            label: {
              normal: {
                show: true,
                color: "green",
                position: "left"
              }
            }
          });
        }

        if (highlightTS === this.line.points[pos][this.tsIdx]) {
          ret.push({
            coord: [
              this.line.points[pos][this.tsIdx],
              this.line.points[pos][this.valIdx]
            ],
            value: this.line.points[pos][this.valIdx],
            symbol: "arrow",
            symbolSize: 25,
            itemStyle: {
              normal: {
                color: "#B55",
                opacity: 0.9
              }
            }
          });
        }

        if (this.line.points[pos][this.trendChgIdx] == true && (this.line.points[pos][this.trendChgIgnoreIdx] == null || this.line.points[pos][this.trendChgIgnoreIdx] == false)) {
          ret.push({
            coord: [
              this.line.points[pos][this.tsIdx],
              this.line.points[pos][this.valIdx]
            ],
            value: this.line.points[pos][this.valIdx],
            symbol: "triangle",
            symbolSize: 18,
            itemStyle: {
              normal: {
                color: "#5B5",
                opacity: 0.9
              }
            }
          });
        }
        let symbol = "pin";
        let color = "#F33";
        let symbolOffset = [0,0];
        if(this.line.points[pos][this.rsSuppressAnomalyIdx] != null && this.line.points[pos][this.rsSuppressAnomalyIdx] == true)
        {
          // symbol = "path://M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7.2C9.9,7.2 8.2,8.9 8.2,11C8.2,14 12,17.5 12,17.5C12,17.5 15.8,14 15.8,11C15.8,8.9 14.1,7.2 12,7.2Z";
          color = "#C0C0C0";
          // symbolOffset = [0, '-50%'];
        }

        if (!tunningParamter) {
          if (this.line.points[pos] && this.anomalyIdx >= 0) {
            ret.push({
              coord: [
                this.line.points[pos][this.tsIdx],
                this.line.points[pos][this.valIdx]
              ],
              value: this.line.points[pos][this.valIdx],
              symbolSize: 10,
              symbol: symbol,
              symbolOffset: symbolOffset,
              itemStyle: {
                normal: {
                  color: color,
                  opacity: 0.9
                }
              }
            });
          }

          upper.push([
            this.line.points[pos][this.tsIdx],
            this.line.points[pos][this.valIdx]
          ]);
          lower.push([
            this.line.points[pos][this.tsIdx],
            this.line.points[pos][this.valIdx]
          ]);
        } else {
          if (
            this.line.points[pos] &&
            this.anomalyIdx >= 0 &&
            tunningParamter.sensitivity &&
            this.line.points[pos][this.valIdx] != null &&
            this.line.points[pos][this.valIdx] != undefined
          ) {
            let result = this.adjustAnomaly(
              tunningParamter,
              this.line.points[pos],
              this.line,
              pos
            );

            if (result["result"] === 1) {
              ret.push({
                coord: [
                  this.line.points[pos][this.tsIdx],
                  this.line.points[pos][this.valIdx]
                ],
                value: this.line.points[pos][this.valIdx],
                symbolSize: 10,
                symbol: symbol,
                symbolOffset: symbolOffset,
                itemStyle: {
                  normal: {
                    color: color
                  }
                }
              });
            } else if (this.line.points[pos][this.rsExpValIdx] != null) {
              ret.push({
                coord: [
                  this.line.points[pos][this.tsIdx],
                  this.line.points[pos][this.valIdx]
                ],
                value: this.line.points[pos][this.valIdx],
                symbolSize: 10,
                symbol: symbol,
                symbolOffset: symbolOffset,
                itemStyle: {
                  normal: {
                    color: "#C0C0C0"
                  }
                }
              });
            }
            /*
            else if (result["result"] === -1) {
              ret.push({
                coord: [
                  this.line.points[pos][this.tsIdx],
                  this.line.points[pos][this.valIdx]
                ],
                value: this.line.points[pos][this.valIdx],
                symbolSize: 10,
                symbol: "pin",
                itemStyle: { normal: { color: "#ff9900", opacity: 0.8 } }
              });
            }
            */

            if (result["upper"]) {
              // max = max < result["upper"] ? result["upper"] : max;
              upper.push([
                this.line.points[pos][this.tsIdx],
                result["upper"] - (result["lower"] > 0 ? result["lower"] : 0)
              ]);
            } else {
              upper.push([this.line.points[pos][this.tsIdx], 0]);
            }
            if (result["lower"]) {
              // min = min > result["lower"] ? result["lower"] : min;
              lower.push([this.line.points[pos][this.tsIdx], result["lower"]]);
            } else {
              lower.push([
                this.line.points[pos][this.tsIdx],
                this.line.points[pos][this.valIdx]
              ]);
            }
          } else {
            if (
              this.line.points[pos][this.valIdx] != null &&
              this.line.points[pos][this.valIdx] != undefined
            ) {
              upper.push([this.line.points[pos][this.tsIdx], 0]);
              lower.push([
                this.line.points[pos][this.tsIdx],
                this.line.points[pos][this.valIdx]
              ]);
            } else {
              upper.push([this.line.points[pos][this.tsIdx], null]);
              lower.push([this.line.points[pos][this.tsIdx], null]);
            }
          }
        }
      }
    }
    return {
      mark: ret,
      upper: upper,
      lower: lower,
      uppermax: max,
      lowermin: min,
      original: original
    };
  }

  transferDate(date, offsetTick = 0) {
    let d = null;

    if (typeof date === "string") {
      d = new Date(date);
    } else {
      d = date;
    }
    if (offsetTick !== 0) {
      d.setTime(d.getTime() + offsetTick);
    }
    return d.getTime();
  }
}