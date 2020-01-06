<template>
  <div>
    <span style="display:none">{{refresh}}</span>
    <div class="col-md-12 tab-body" :style="{height: CanvasHeight + 'px', width: ChartWidth}">
      <div v-if="Lines" class="main" :id="CanvasId" :style="{height: ChartHeight + 'px', width: ChartWidth}" 
          @mousedown.shift="onMouseDown" @mouseup.shift="onMouseUp" @mousedown.exact="onMouseDown" @mouseup.exact="onMouseUpIfHighTS" @datazoom="onDataZoom">
      </div>
      <div v-if="!Lines" class="main" :style="{height: ChartHeight + 'px', width: ChartWidth}">
        <div style="margin-top: 35%; width: 100%; text-align: center;font-size :16px; color: #939393">
          No data!
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import echarts from "echarts";
import { Line } from "./Line.js";
import _ from "lodash";
import $ from "jquery";
import { TimeHelper } from "@/common/TimeHelper.js";
import moment from "moment";

export default {
  props: {
    Lines: Array,
    CanvasId: String,
    CanvasHeight: String,
    ChartHeight: String,
    ChartWidth: String,
    TunningParameters: Object,
    BaseTagSet: Object,
    Gran: String, // define timetype(yearly, monthly,weekly,daily,hourly,and seconds(with customgran together))
    CustomGran: Number,
    Zooming: Boolean,
    Toolbox: Boolean,
    Scientist: Boolean,
    ShowLegend: Boolean,
    HighlightTS: String,
    HideGap: Boolean,
    Prediction: Boolean,
    PredictionOnly: Boolean,
    ShowAnomaly: Boolean,
    XIndex: Array,
    Sampled: Boolean,
    SampledStep: Number,
    refreshCount: Number, 
    stack: Boolean, 
    YLog: Number,
    FixedLegend: Boolean,      // Default false, if not true, append dimensions
    MarkStart: String, 
    MarkEnd: String
  },
  data() {
    return {
      localParameters: {},
      myChart: null,
      lines: [],
      mergedIdx: [],
      currentTab: "",
      refresh: 1,
      mouseDownOffsetX: 0,
      currentX: "",
      currentTimestamp: "",
      idxIniting: false,
      inited: false,
      changeTune: null, 
      firstInit: true
    };
  },
  watch: {
    stack: function(val, oldVal) {
      this.changeTune();
    },
    Sampled: function(val, oldVal) {
      if (val != oldVal) {
        this.mergedIdx = [];
        this.changeTune();
      }
    },
    PredictionOnly: function(val, oldVal) {
      if (val != oldVal) {
        this.changeTune();
      }
    }, 
    MarkStart: function(val, oldVal) {
      this.renderRangeSelection(this.MarkStart, this.MarkEnd);
    }, 
    MarkEnd: function(val, oldVal) {
      this.renderRangeSelection(this.MarkStart, this.MarkEnd);
    }
  },

  created() {
    this.changeTune = _.debounce(function() {
      this.AssignTP(this.TunningParameters);
      if (this.Lines.length > 0) {
        this.changeTab("Original");
      }
    }, 300);
  },
  mounted() {
    if (this.XIndex) {
      this.mergedIdx = this.XIndex;
    }
    if (this.Lines && this.Lines.length > 0) {
      this.changeTune();
    }
    this.$watch("Sampled", onSampledChanged);
    this.$watch("YLog", onYLogChange);
    this.$watch("PredictionOnly", onPredictionOnlyChanged);
    this.$watch("refreshCount", onRefresh);
    this.$watch("Lines", onLinesChanged, { immediate: true, deep: true });
    this.$watch("HighlightTS", onHighlightTSChanged, {
      deep: true
    });
    this.$watch("XIndex", onMergedIdxChanged, {
      deep: true
    });
    this.$watch("TunningParameters", onTunningParametersChanged, {
      immediate: true,
      deep: true
    });

    function onRefresh(val, oldVal) {
        this.changeTune();
    }
    function onMergedIdxChanged(val, oldVal) {
      if (this.XIndex) {
        this.mergedIdx = this.XIndex;
      }
      this.changeTune();
    }
    function onSampledChanged(val, oldVal) {
      if (val != oldVal) {
        this.mergedIdx = [];
        this.changeTune();
      }
    }
    function onYLogChange(val, oldVal) {
      this.changeTune();
    }
    function onPredictionOnlyChanged(val, oldVal) {
      if (val != oldVal) {
        this.changeTune();
      }
    }
    function onTunningParametersChanged(val, oldVal) {
      let local = this.copyTP(val);
      if (this.Lines && val && oldVal && JSON.stringify(this.localParameters) != JSON.stringify(local)) {
        this.changeTune();
      }
    }
    function onHighlightTSChanged(val, oldVal) {
      if (this.Lines.length > 0 && val != oldVal) {
        if (val != this.currentTimestamp) {
          this.firstInit = true;
        }
        
        this.changeTune();
      }
    }
    function onLinesChanged(val, oldVal) {
      if (this.Lines && val && oldVal) {
        this.changeTune();
      }
    }
    
  },

  methods: {
    onMouseDown(event) {
      if (event.offsetY < Number(option.grid[0].top) || this.lines.length > 1) {
        return false;
      }

      this.mouseDownOffsetX = event.offsetX;
    },
    onDataZoom: function(event) {
      if (!event.batch) {
        return;
      }
      let start = this.mergedIdx[event.batch[0].startValue];
      let end = this.mergedIdx[event.batch[0].endValue];
      this.$emit("dataZoom", {start: start, end: end});
    },
    onMouseUpIfHighTS(event) {
        this.onMouseUp(event);
    }, 
    onMouseUp(event) {
      if (event.offsetY < Number(option.grid[0].top) || event.offsetX < 20 || this.lines.length !== 1) {
        
        return false;
      }

      if (this.mouseDownOffsetX - event.offsetX > 10 || this.mouseDownOffsetX - event.offsetX < -10) {
        return false;
      }
      if (this.currentTimestamp) {
        this.emitClick(this.currentTimestamp, "ptclick")
      } else {
        return false;
      }
    },
    emitClick(ts, event) {
        let point; 
        let pos;
        for (let i = 0; i < this.lines[0].line.points.length; i++) {
          if (this.lines[0].line.points[i][this.lines[0].tsIdx] == ts) {
            point = this.lines[0].line.points[i];
            pos = i;
            break;
          }
        }
        let result=null;
        if(this.TunningParameters){
          result = this.lines[0].adjustAnomaly(this.TunningParameters, point, this.lines[0]["line"], pos);
        }
        

        let eventPara = {
          line: this.lines[0]["line"],
          index: pos,
          timestamp: ts,
          tunningParameters: this.TunningParameters, 
          isAnomaly: result?result.result:null
        };

        this.$emit(event, eventPara);
    }, 
    changeTab(tab) {
      this.currentTab = tab;
      this.initLines();
    
      if (this.lines.length == 1 && this.HighlightTS && this.firstInit) {
        this.firstInit = false;
        this.emitClick(this.HighlightTS, "initclick")
      }
    },

    copyTP(tp) {
      let localParameters = {};
      if (!tp) {
        localParameters.sensitivity = 95;
        localParameters.upperBound = 0;
        localParameters.lowerBound = 0;
        localParameters.anomalyDetectorDirection = 3;
        localParameters.anomalyDetectorType = "SmartDetector";
        localParameters.autoSnooze = 0;
        localParameters.minAlertNumber = 1;
        localParameters.minAlertRatio = 100;
        localParameters.severity = 4;
        localParameters.spikeOnly = false;
        localParameters.changePercentage = 5.0;
        localParameters.changePercentageOver = 1;
        return localParameters;
      }
      let detectionType = tp.anomalyDetectorType;

      let anomalyDetectorDirection = tp.anomalyDetectorDirection;
      if (anomalyDetectorDirection === "Both") {
        anomalyDetectorDirection = 3;
      } else if (anomalyDetectorDirection === "Neg") {
        anomalyDetectorDirection = 1;
      } else if (anomalyDetectorDirection === "Pos") {
        anomalyDetectorDirection = 2;
      }

      localParameters.sensitivity = Number(tp.sensitivity);
      localParameters.upperBound = Number(tp.upperBound);
      localParameters.lowerBound = Number(tp.lowerBound);
      localParameters.anomalyDetectorDirection = anomalyDetectorDirection;

      localParameters.anomalyDetectorType = detectionType;
      localParameters.autoSnooze = Number(tp.autoSnooze);
      localParameters.minAlertNumber = Number(tp.minAlertNumber);
      localParameters.severity = Number(tp.severity);
      localParameters.spikeOnly = tp.spikeOnly;
      localParameters.minAlertRatio = Number(tp.minAlertRatio);
      localParameters.changePercentage = Number(tp.changePercentage) > 0 ? Number(tp.changePercentage) : 5;
      localParameters.changePercentageOver = Number(tp.changePercentageOver) > 0 ? Number(tp.changePercentageOver) : 1;
      return localParameters;
    },
    AssignTP(tp) {
      this.localParameters = {};
      if (!tp) {
        this.localParameters.sensitivity = 95;
        this.localParameters.upperBound = 0;
        this.localParameters.lowerBound = 0;
        this.localParameters.anomalyDetectorDirection = 3;
        this.localParameters.anomalyDetectorType = "SmartDetector";
        this.localParameters.autoSnooze = 0;
        this.localParameters.minAlertNumber = 1;
        this.localParameters.minAlertRatio = 100;
        this.localParameters.severity = 4;
        this.localParameters.spikeOnly = false;
        this.localParameters.changePercentage = 5.0;
        this.localParameters.changePercentageOver = 1;
        return;
      }
      let detectionType = tp.anomalyDetectorType;

      let anomalyDetectorDirection = tp.anomalyDetectorDirection;
      if (anomalyDetectorDirection === "Both") {
        anomalyDetectorDirection = 3;
      } else if (anomalyDetectorDirection === "Neg") {
        anomalyDetectorDirection = 1;
      } else if (anomalyDetectorDirection === "Pos") {
        anomalyDetectorDirection = 2;
      }

      this.localParameters.sensitivity = Number(tp.sensitivity);
      this.localParameters.upperBound = Number(tp.upperBound);
      this.localParameters.lowerBound = Number(tp.lowerBound);
      this.localParameters.anomalyDetectorDirection = anomalyDetectorDirection;

      this.localParameters.anomalyDetectorType = detectionType;
      this.localParameters.autoSnooze = Number(tp.autoSnooze);
      this.localParameters.minAlertNumber = Number(tp.minAlertNumber);
      this.localParameters.severity = Number(tp.severity);
      this.localParameters.spikeOnly = tp.spikeOnly;
      this.localParameters.minAlertRatio = Number(tp.minAlertRatio);
      this.localParameters.changePercentage = Number(tp.changePercentage) > 0 ? Number(tp.changePercentage) : 5;
      this.localParameters.changePercentageOver = Number(tp.changePercentageOver) > 0 ? Number(tp.changePercentageOver) : 1;
    },

    initLines() {
      this.lines = [];
      for (let idx = 0; idx < this.Lines.length; idx++) {
        let line = new Line(this.Lines[idx], this.mergedIdx, this.Gran, this.CustomGran);
        this.lines.push(line);
      }

      if (this.myChart != null) {
        this.myChart.dispose();
      }
      let self = this;
      let dom = document.getElementById(this.CanvasId);
      if (!dom) {
        return;
      }

      this.myChart = echarts.init(document.getElementById(this.CanvasId));
      this.myChart.on('dataZoom', this.onDataZoom);
      
      window.addEventListener(
        "resize",
        function() {
          if (this.myChart) {
            this.myChart.resize();
          }
        }.bind(this)
      );

      let opt = $.extend(true, {}, option);

      opt.tooltip.formatter = function(paramslist) {
        let ret = "<div>";
        let hastime = false;
        let sum = 0;
        for (let i = 0; i < paramslist.length; i++) {
          let params = paramslist[i];
          if (params && params.data) {
            if (
              params.seriesName === "Forecast" ||
              params.seriesName === "Forecast Bound" ||
              params.seriesName === "Confidence Bound" ||
              params.seriesName.split("_").pop() === "loss"
            ) {
            } else {
              if (!self.lines[i]) {
                continue;
              }
              if (!hastime && params.value != null) {
                self.currentTimestamp = params.value[self.lines[i].tsIdx];
              }
              if (!hastime && params.value != null) {

                ret += "<div class='col-md-12' style='text-align:left'>" + self.currentTimestamp + "&nbsp;";
                if (self.TunningParameters) {
                  let anomaly = self.lines[i].adjustAnomaly(self.TunningParameters, params.value, self.lines[i].line, params.dataIndex)
                  if (anomaly.result == 1) {
                    ret += "<span style='text-align:left; color: #ed4014'><B>Anomaly! </B>&nbsp;</span>";
                  } else if (anomaly.result == -1) {
                    // ret += "<span style='text-align:left; color: #F90'><B>Suspected anomaly! </B>&nbsp;</span>";
                  }
                }
                ret += "</div>";
                hastime = true;
              }
              if (params.value != null) {
                ret +=
                  "<div class='col-md-12'><span style='background-color: " +
                  params.color +
                  ";border-radius: 5px; width: 10px; height: 10px'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" +
                  params.seriesName +
                  ":&nbsp;<B>";
                  ret += params.value[self.lines[i].valIdx];
                ret += "</B></div>";
                if (params.value[self.lines[i].valIdx] != null) {
                  sum += params.value[self.lines[i].valIdx];
                }


                if (self.ShowAnomaly) {
                  if (self.lines[i].expIdx >= 0 && params.value[self.lines[i].expIdx] !== null && params.value[self.lines[i].valIdx] != null) {
                    ret += "<div class='col-md-12' style='text-align:left'><span style='width: 200px;'>Expected:</span>&nbsp;";
                    ret += params.value[self.lines[i].expIdx];
                    ret += "</div>";
                    ret += "<div class='col-md-12' style='text-align:left'>Delta:&nbsp;";
                    ret +=
                      params.value[self.lines[i].expIdx] !== 0 ? ((params.value[self.lines[i].valIdx] - params.value[self.lines[i].expIdx]) * 100 / params.value[self.lines[i].expIdx]).toFixed(2) + "%" : "N/A";
                    ret += "</div>";
                  }

                  if (self.lines[i].meanIdx >= 0 && params.value[self.lines[i].meanIdx] !== null && params.value[self.lines[i].meanIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>Mean:&nbsp;";
                    ret += params.value[self.lines[i].meanIdx];
                    ret += "</div>";
                  }

                  if (self.lines[i].trendIdx >= 0 && params.value[self.lines[i].trendIdx] !== null && params.value[self.lines[i].trendIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>IsTrendChangePoint:&nbsp;";
                    ret += params.value[self.lines[i].trendIdx];
                    ret += "</div>";
                  }

                  if (self.lines[i].stdIdx >= 0 && params.value[self.lines[i].stdIdx] !== null && params.value[self.lines[i].stdIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>STD:&nbsp;";
                    ret += params.value[self.lines[i].stdIdx];
                    ret += "</div>";
                  }

                  if (self.lines[i].periodIdx >= 0 && params.value[self.lines[i].periodIdx] !== null && params.value[self.lines[i].periodIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>Min Period</B>:&nbsp;";
                    ret += params.value[self.lines[i].periodIdx];
                    ret += "</div>";
                  }

                  if (self.lines[i].predictValIdx >= 0 && params.value[self.lines[i].predictValIdx] !== null && params.value[self.lines[i].predictValIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>Predicted:&nbsp;";
                    ret += params.value[self.lines[i].predictValIdx];
                    ret += "</div>";
                  }
                  if (self.lines[i].costIdx >= 0 && params.value[self.lines[i].costIdx] !== null && params.value[self.lines[i].costIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>Window:&nbsp;";
                    ret += params.value[self.lines[i].costIdx];
                    ret += "</div>";
                  }
                  if (self.lines[i].rsSuppressAnomalyIdx >= 0 && params.value[self.lines[i].rsSuppressAnomalyIdx] != null && params.value[self.lines[i].rsSuppressAnomalyIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>Suppress Anomaly:&nbsp;";
                    ret += params.value[self.lines[i].rsSuppressAnomalyIdx];    
                    ret += "</div>";
                  }
                  if (self.lines[i].rsExpValIdx >= 0 && params.value[self.lines[i].rsExpValIdx] != null && params.value[self.lines[i].rsExpValIdx] !== undefined) {
                    ret += "<div class='col-md-12' style='text-align:left'>RSExpected:&nbsp;";
                    ret += params.value[self.lines[i].rsExpValIdx];
                    ret += "</div>";
                  }
                }
                if (self.lines[i].trendChgIdx >= 0 && params.value[self.lines[i].trendChgIdx] !== null 
                    && self.lines[i].trendChgIgnoreIdx >= 0 && !!!params.value[self.lines[i].trendChgIgnoreIdx]) {
                  ret += "<div class='col-md-12' style='text-align:left'>TrendChange:&nbsp;";
                  ret += params.value[self.lines[i].trendChgIdx];
                  ret += "</div>";
                }
                if (self.PredictionOnly || self.Prediction) {
                  if (self.lines[i].predictScoreIdx >= 0 
                      && params.value[self.lines[i].predictScoreIdx] !== null && params.value[self.lines[i].predictScoreIdx] !== undefined
                      && params.value[self.lines[i].predictValIdx] != null) {
                    let from;
                    let to;
                    let val = params.value[self.lines[i].predictScoreIdx];
                    if (params.value[self.lines[i].predictValIdx] > 0) {
                      to = (1 + (100 - val) * 1.0 / 100.0) * params.value[self.lines[i].predictValIdx];
                      from = (1 - (100 - val) * 1.0 / 100.0) * params.value[self.lines[i].predictValIdx];
                    } else {
                      to = (1 - (100 - val) * 1.0 / 100.0) * Math.abs(params.value[line.predictValIdx]);
                      from = (1 + (100 - val) * 1.0 / 100.0) * params.value[line.predictValIdx];
                    }
                    ret += "<div class='col-md-12' style='text-align:left'>Forecast range:&nbsp;";
                    ret += from + " ~ " + to;
                    ret += "</div>";
                  }
                } 
              }
            }
          }
        }
        ret += "</div>";
        if (!self.ShowAnomaly && self.stack) {
                let tmp =
                  "<div class='col-md-12'>Sum: <B>";
                tmp += sum;
                tmp += "</B></div>";
                ret = tmp + ret;
        }

        // ret += "<div class='col-md-12' style='text-align:left; color: #Ff0'>Press 'Ctrl' and use mouse wheel to zoom. </B>&nbsp;</div>";
        return ret;
      };

      opt.tooltip.axisPointer.label.formatter = function(params){
        let value = params.value;
        if(params.seriesData.length > 0)
        {
          value = self.myChart._chartsViews[0].__model.dependentModels.xAxis[0].axis.scale.getLabel(value, {
            precision: "auto"
          })
        }
        else
        {
          value = self.myChart._chartsViews[0].__model.dependentModels.yAxis[0].axis.scale.getLabel(value, {
            precision: "auto"
          })
        }
        if(params.seriesData.length > 0)
        {
          if(self.lines[0].rsHolidayInfoIdx >= 0)
          {
            let holidayInfo = params.seriesData[0].data[self.lines[0].rsHolidayInfoIdx];
            if(holidayInfo)
            {
              value = value.replace("\n", " ");
              value = value + "\n"+holidayInfo;
            }
          }
        }
        return value;
      }

      if (this.lines.length === 1) {
        if (this.Scientist) {
          let legend = ["Value"];
          if (this.Lines[0]["id"]["enablePrediction"] === true && this.Lines[0]["id"]["predictionResultReady"] === true) {
            legend.push.apply(legend, ["Forecast"]);
          }
          if (this.Gran === "Daily" || this.Gran === "Hourly" || this.Gran === "Custom") {
            legend.push.apply(legend, ["1 WeekOff", "2 WeekOff", "3 WeekOff", "4 WeekOff"]);
          } else if (this.Gran === "Monthly") {
            legend.push.apply(legend, ["OneYearOff"]);
          }
          opt = this.loadSingleLine(this.lines[0], opt, legend, true);
        } else {
          let legends = [];
          if (this.Prediction) {
            legends.push("Actual");
            legends.push("Forecast");
          } else {
            let legend = this.lines[0].getIdLegend();
            if (this.Lines[0].id.legendName) {
              if (legend) {
                if (this.FixedLegend != true) {
                  legend = this.lines[0]["line"].id.legendName + " (" + legend + ") ";
                }
                else {
                  legend = this.lines[0]["line"].id.legendName;
                }
              }
              else {
                legend = this.Lines[0].id.legendName;
              }
            }
            legends.push(legend);
          }
          opt = this.loadSingleLine(this.lines[0], opt, legends, true);
        }
      } else {
        opt = this.loadLines(opt);
      }

      if (this.Zooming) {
        opt.dataZoom = [
          {
            type: "inside",
            xAxisIndex: 0,
            zoomOnMouseWheel: "ctrl", 
            filterMode: "weakFilter"
          },
          {
            type: "slider",
            xAxisIndex: 0, 
            filterMode: "weakFilter"
          }, 
          {
              type: 'slider',
              show: true,
              yAxisIndex: 0,
              filterMode: 'empty',
              width: 20,
              height: '70%',
              handleSize: 20,
              showDataShadow: false,
              zoomOnMouseWheel: "ctrl", 
              left: '0'
          }
        ];
      }

      if (this.Toolbox) {
        opt.toolbox.show = true;
      } else {
        opt.toolbox.show = false;
      }

      if (this.ShowLegend === false) {
        opt.legend.show = false;
      }

      if (this.YLog > 0) {
        opt.yAxis[0].type = "log";
      }

      this.myChart.setOption(opt);

      this.refresh += 1;
    },

    renderRangeSelection(st, et) {
      if (st == null || et == null) {
        return;
      }
      let markArea = {
        data: [
          [
            {
              name: "Selected",
              xAxis: st
            },
            {
              xAxis: et
            }
          ]
        ],
        itemStyle: {
          color: "rgba(210, 210, 210, 1)"
        },
        label: {
          color: "rgba(188, 188, 188, 1)"
        }
      };
      let mark = $.extend(true, {}, markOption);
      let markret = this.lines[0].getMarkData(this.localParameters, et, false, 0);
      // console.log(markret);
      mark.data = markret["mark"];
      this.myChart.setOption({ series: [{ markArea: markArea, markPoint: mark }] });
    },

    loadSingleLine(line, opt, legend, boundary = false) {
      let min = Number.MAX_VALUE;
      let max = Number.MIN_VALUE;
      if (!line) {
        return opt;
      }
      
      opt.legend.data.push.apply(opt.legend.data, legend);
      for (let i = 0; i < legend.length; i++) {
        if (i === 0) {
          opt.legend.selected[legend[i]] = true;
        } else {
          opt.legend.selected[legend[i]] = false;
        }
      }
      opt.legend.selected[legend[0]] = true;
      for (let key in legend) {
        switch (legend[key]) {
          case "1 WeekOff": {
            let trend = $.extend(true, {}, serieOption);
            trend["lineStyle"] = { normal: { type: "dotted", width: 2 } };
            let tmp = line.getLineWeekOffsetData(1);
            for (let idx in tmp) {
              trend.data.push(tmp[idx]);
              // min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              // max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }
            trend.name = legend[key];
            opt.series.push(trend);
            break;
          }
          case "2 WeekOff": {
            let trend = $.extend(true, {}, serieOption);
            trend["lineStyle"] = { normal: { type: "dotted", width: 2 } };
            let tmp = line.getLineWeekOffsetData(2);
            for (let idx in tmp) {
              trend.data.push(tmp[idx]);
              // min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              // max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }

            trend.name = legend[key];
            opt.series.push(trend);
            break;
          }
          case "3 WeekOff": {
            let trend = $.extend(true, {}, serieOption);
            trend["lineStyle"] = { normal: { type: "dotted", width: 2 } };
            let tmp = line.getLineWeekOffsetData(3);
            for (let idx in tmp) {
              trend.data.push(tmp[idx]);
              // min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              // max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }

            trend.name = legend[key];
            opt.series.push(trend);
            break;
          }
          case "4 WeekOff": {
            let trend = $.extend(true, {}, serieOption);
            trend["lineStyle"] = { normal: { type: "dotted", width: 2 } };
            let tmp = line.getLineWeekOffsetData(4);
            for (let idx in tmp) {
              trend.data.push(tmp[idx]);
              // min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              // max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }

            trend.name = legend[key];
            opt.series.push(trend);
            break;
          }
          case "OneYearOff": {
            let trend = $.extend(true, {}, serieOption);
            trend["lineStyle"] = { normal: { type: "dotted", width: 2 } };
            let tmp = line.getLineYearOffsetData(1);
            for (let idx in tmp) {
              trend.data.push(tmp[idx]);
              // min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              // max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }

            trend.name = legend[key];
            opt.series.push(trend);
            break;
          }
          case "Forecast":
            break;
          case "Value":
          default: {
            let original = $.extend(true, {}, serieOption);
            let lowy = $.extend(true, {}, boundSerieOption);
            let highy = $.extend(true, {}, boundSerieOption);
            if (this.ShowAnomaly && !this.PredictionOnly) {
              let mark = $.extend(true, {}, markOption);
              let markret = line.getMarkData(this.localParameters, this.HighlightTS, this.Sampled, this.SampledStep);
              mark.data = markret["mark"];
              if (this.MarkStart != null && this.MarkEnd != null) {
                let markArea = {
                  data: [
                    [
                      {
                        name: "Selected",
                        xAxis: this.MarkStart
                      },
                      {
                        xAxis: this.MarkEnd
                      }
                    ]
                  ],
                  itemStyle: {
                    color: "rgba(210, 210, 210, 1)"
                  },
                  label: {
                    color: "rgba(188, 188, 188, 1)"
                  }
                };
                original.markArea = markArea;
              }


              original.data = markret["original"];
              original.dimensions = line.line.columns
              
              // max = markret.uppermax != null ? markret.uppermax : max;
              // min = markret.lowermin != null ? markret.lowermin : min;
              if (
                this.localParameters.anomalyDetectorType === "HardThreshold" &&
                this.localParameters.upperBound >= this.localParameters.lowerBound
              ) {
                original.markLine = {
                  data: [{ yAxis: this.localParameters.lowerBound }, { yAxis: this.localParameters.upperBound }]
                };
                original.markLine.lineStyle = { normal: { type: "solid" } };
                original.markLine.label = { show: true, position: "top" };
                // min = min > this.localParameters.lowerBound ? this.localParameters.lowerBound : min;
                // max = max < this.localParameters.upperBound ? this.localParameters.upperBound : max;
              }

              lowy.data = markret["lower"];
              lowy.name = "Confidence Bound";
              lowy.areaStyle = null;

              highy.data = markret["upper"];
              highy.name = "Confidence Bound";
              highy.areaStyle = { normal: { color: "#CCF" } };
              
              // min = min > markret["lowermin"] ? markret["lowermin"] : min;
              // max = max < markret["uppermax"] ? markret["uppermax"] : max;
              original.markPoint = mark;
            }
            else {
              let tmp = line.getLineData();
              // min = min > tmp.min ? tmp.min : min;
              // max = max < tmp.max ? tmp.max : max;
              original.data = tmp.data;
            }            
            
            /*
            let lossdata = $.extend(true, {}, lossSerieOption);
            lossdata.data = tmp;
            lossdata.name = legend[key] + "_loss";
            */

            original.name = legend[key];
            let predictLow = $.extend(true, {}, predictBoundSerieOption);
            let predictUpper = $.extend(true, {}, predictBoundSerieOption);
            // opt.series.push(lossdata);

            opt.series.push(original);
            if (this.ShowAnomaly && !this.PredictionOnly) {
              opt.series.push(lowy);
              opt.series.push(highy);
            }
            if (this.Prediction || this.PredictionOnly) {
              let predict = line.getLinePredictionData(this.PredictionOnly);
              let predictionData = $.extend(true, {}, predictSerieOption);
              predictionData.data = predict.value;
              predictionData.name = "Forecast";
              opt.series.push(predictionData);

              predictLow.data = predict.lower;
              predictLow.name = "Forecast Bound";
              predictLow.areaStyle = null;

              predictUpper.data = predict.upper;
              predictUpper.name = "Forecast Bound";
              /* 
              for (let idx = 0; idx < predict.value.length; idx++) {
                min = (predict.lower[idx] != null && predict.lower[idx][1] != null && min > predict.lower[idx][1]) ? predict.lower[idx][1] : min;
                max = (predict.lower[idx] != null && predict.lower[idx][1] != null && predict.upper[idx] != null && predict.upper[idx][1] != null && max < (predict.upper[idx][1] + predict.lower[idx][1])) ? (predict.upper[idx][1] + predict.lower[idx][1]) : max;
              }
              */ 
              opt.series.push(predictLow);
              opt.series.push(predictUpper);
            }
            break;
          }
        }
      }

      // let gap = Number(((max - min) / 10).toFixed(2));
      /*
      if (min < Number.MAX_VALUE) {
        // opt.yAxis[0].min = Math.round((min - gap) * 100 - 1) * 1.0 / 100.0;
        // opt.yAxis[0].max =  Math.round((max + gap) * 100 + 1) * 1.0 / 100.0;
      }
      */
      return opt;
    },

    loadOneLine(line, opt, legend, currentTab = "Value") {
      if (legend == '') {
        legend = "<No alias>";
      }
      if (opt.legend.data.indexOf(legend) >= 0) {
        legend = legend + line.line.id.seriesId;
      }
      opt.legend.data.push(legend);
      // opt.xAxis[0].data = this.mergedIdx;

      switch (currentTab) {
        case "Mean": {
          let mean = $.extend(true, {}, serieOption);
          let tmp = line.getLineMeanData();
          for (let idx in tmp) {
            mean.data.push(tmp[idx]);
          }

          mean.name = legend;
          opt.series.push(mean);
          break;
        }
        case "STD": {
          let std = $.extend(true, {}, serieOption);
          let tmp = line.getLineSTDData();
          for (let idx in tmp) {
            std.data.push(tmp[idx]);
          }

          std.name = legend;
          opt.series.push(std);
          break;
        }
        case "Trend": {
          let trend = $.extend(true, {}, serieOption);
          let tmp = line.getLineTrendData();
          for (let idx in tmp) {
            trend.data.push(tmp[idx]);
          }

          trend.name = legend;
          opt.series.push(trend);
          break;
        }
        case "Value":
        default: {
          let original = $.extend(true, {}, serieOption);
          if (this.stack) {
            original.stack = "dataline";
            original.areaStyle = {};
          } else {
            original.stack = null;
            delete original.areaStyle;
          }
          
          let mark = $.extend(true, {}, markOption);
          let markret;
          if (this.ShowAnomaly) {
            markret = line.getMarkData(this.localParameters);
            original.data = markret['original'];
            mark.data = markret["mark"];
            original.markPoint = mark;
            original.dimensions = line.line.columns;
          }
          else {
            markret = line.getLineData();
            original.data = markret.data;
          }

          original.name = legend;
          opt.series.push(original);
          break;
        }
      }
      
      return opt;
    },
    loadLines(opt) {
      for (let idx in this.lines) {
        if (!this.lines[idx]["line"].id) {
          continue;
        }
        let legend = this.lines[idx].getIdLegend();
        if (this.lines[idx]["line"].id.legendName) {
          
          if (legend) {
            if (this.FixedLegend != true) {
              legend = this.lines[idx]["line"].id.legendName + " (" + legend + ") ";
            }
            else {
              legend = this.lines[idx]["line"].id.legendName;
            }
          }
          else {
            legend = this.lines[idx]["line"].id.legendName;
          }
        }
        
        this.loadOneLine(this.lines[idx], opt, legend, this.currentTab);
      }

      return opt;
    }
  }
};

let option = {
  animation: false,
  title: {
    show: false
  },
  legend: {
    show: true,
    data: [],
    selected: {}
  },
  color: [
    "#004072",
    "#5998D9",
    "#E7733D",
    "#1FA778",
    "#EC4B7A",
    "#935ECE",
    "#1AA2B2",
    "#535DF4",
    "#BE3C9D",
    "#6C8792",
    "#ED6868",
    "#336496",
    "#FF8383"
  ],

  dataZoom: [],
  toolbox: {
    show: true,
    feature: {
      dataZoom: {
          yAxisIndex: false, 
          title: {zoom: 'Zoom', back: 'Reset'}
      },
      dataView: {
        readOnly: false,
        title: "Data View",
        lang: ["Data View", "Close", "Refresh"]
      },
      saveAsImage: { show: true, title: "Save Image" },
      magicType: {
        show: false,
        type: ["line", "bar"],
        title: { line: "Line", bar: "Bar" }
      }
    }
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      animation: false,
      label: {
        backgroundColor: "#ccc",
        borderColor: "#aaa",
        borderWidth: 1,
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        textStyle: {
          color: "#222"
        },
        formatter:null
      }
    },
    position: [10, 10],
    formatter: null
  },
  xAxis: [
    {
      type: "time",
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: "#aaa"
        }
      },
      axisPointer:{
        show:true,
        formatter:"{value}[Holiday]"
      }
      // data: []
    }
  ],
  grid: [
    {
      left: 10,
      right: 10,
      top: "50",
      bottom: "8%",
      containLabel: true
    }
  ],
  yAxis: [
    {
      name: "Value",
      type: "value",
      scale: true,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      }
    }
  ],
  series: [],
  useUTC:true
};

let serieOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 5,
  showSymbol: false,
  showAllSymbol: true,
  connectNulls: false,
  data: [],
  markPoint: null,
  markLine: null
};

let markOption = {
  data: [],
  symbolSize: 15,
  silent: true,
  label: {
    normal: {
      show: false
    }
  },
  itemStyle: {
    normal: {
      color: "#E04B4A"
    }
  }
};

let lossSerieOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 0,
  showSymbol: false,
  showAllSymbol: false,
  connectNulls: false,
  lineStyle: { normal: { type: "dotted", color: "#CCC" } },
  data: []
};

let predictSerieOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 1,
  showSymbol: false,
  showAllSymbol: true,
  connectNulls: false,
  lineStyle: { normal: { type: "dotted" } },
  data: []
};
let predictBoundSerieOption = {
  name: "",
  type: "line",
  symbol: "none",
  connectNulls: false,
  data: [],
  lineStyle: {
    normal: {
      opacity: 0
    }
  },
  areaStyle: {},
  itemStyle: { normal: { color: "rgba(25, 190, 107, 0.7)", lineStyle: { color: "rgba(25, 190, 107, 0.7)" } } },
  stack: "predict-band"
};
let boundSerieOption = {
  name: "",
  type: "line",
  symbol: "none",
  connectNulls: false,
  data: [],
  lineStyle: {
    normal: {
      opacity: 0
    }
  },
  areaStyle: {},
  itemStyle: { normal: { color: "#CCF", lineStyle: { color: "#CCF" } } },
  stack: "confidence-band"
};
</script>

<style scoped lang="scss">
.tab-active {
  border-bottom: 2px solid #004072 !important;
}

.tab {
  cursor: pointer;
  border: 0px solid #ccc;
  padding: 5px;
  text-align: center;
  font-size: 12px;
}
</style>
