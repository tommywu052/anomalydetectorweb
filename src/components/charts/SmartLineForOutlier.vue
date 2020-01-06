<template>
  <div>
    <span style="display:none">{{refresh}}</span>
    <div class="col-md-12 tab-body"
         :style="{height: CanvasHeight + 'px', width: ChartWidth}">
      <div v-if="Lines"
           class="main"
           :id="CanvasId"
           :style="{height: ChartHeight + 'px', width: ChartWidth}"
           >
      </div>
      <div v-if="!Lines"
           class="main"
           :style="{height: ChartHeight + 'px', width: ChartWidth}">
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

export default {
  props: {
    Lines: Array || Object,
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
    ShowLegend: Boolean,
    HighlightTS: String,
    HideGap: Boolean,
    XIndex: Array,
    refreshCount: Number,
    windowStartFrom: String,
    MeanTrend: Array
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
      inited: false
    };
  },
  watch: {},
  created() {
    this.changeTune = _.debounce(function() {
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

    this.$watch("refreshCount", onRefresh);
    // this.$watch("Lines", onLinesChanged, { immediate: true, deep: true });
    this.$watch("HighlightTS", onHighlightTSChanged, {
      deep: true
    });

    function onRefresh() {
      this.changeTune();
    }
    function onMergedIdxChanged(val, oldVal) {
      if (this.XIndex) {
        this.mergedIdx = this.XIndex;
      }
      this.changeTune();
    }

    function onHighlightTSChanged(val, oldVal) {
      if (this.Lines.length > 0 && val != oldVal) {
        if (this.Sampled) {
          this.mergedIdx = [];
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
      // if (event.event.offsetY < Number(option.grid[0].top) || this.lines.length > 1) {
      //   return false;
      // }

      this.mouseDownOffsetX = event.event.offsetX;
    },

    onMouseUp(event) {
      // if (event.event.offsetY < Number(option.grid[0].top) || this.lines.length !== 1) {
      //   return false;
      // }

      // if (this.mouseDownOffsetX - event.event.offsetX > 10 || this.mouseDownOffsetX - event.event.offsetX < -10) {
      //   return false;
      // }
      // debugger;
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

      let eventPara = {
        line: this.lines[0]["line"],
        index: pos,
        timestamp: ts,
      };

      this.$emit(event, eventPara);
    },
    changeTab(tab) {
      this.currentTab = tab;
      this.initLines();
    },

    initIdx() {
      if (this.mergedIdx.length > 0) {
        return;
      }

      this.mergedIdx = [];
      for (let i = 0; i < this.Lines.length; i++) {
        let cachedPos = 0;
        for (let j = 0; j < this.Lines[i]["points"].length; j++) {
          let point = this.Lines[i]["points"][j];
          let mode = 86400000;
          if (this.Gran == "Custom" && 3600000 % this.CustomGran == 0) {
            mode = 3600000;
          }
          if (this.HighlightTS && this.Sampled && (new Date(point["timestamp"]).getTime() - new Date(this.HighlightTS).getTime()) % mode != 0) {
            continue;
          }
          let ts = TimeHelper.convertDate2UniformString(new Date(point["timestamp"]), this.Gran);
          if (this.mergedIdx.indexOf(ts) < 0) {
            this.mergedIdx.push(ts);
          }
        }
      }

      this.mergedIdx.sort();
      if (this.HideGap) {
        return;
      }
      let step = 0;
      if (this.Gran === "Daily") {
        step = 86400000;
      } else if (this.Gran === "Hourly") {
        if (!this.Sampled) {
          step = 3600000;
        } else {
          step = 86400000;
        }
      } else if (this.Gran === "Weekly") {
        step = 86400000 * 7;
      } else if (this.Gran === "Custom" && this.CustomGran) {
        if (!this.Sampled) {
          step = this.CustomGran * 1000;
        } else if (3600000 % this.CustomGran == 0) {
          step = 3600000;
        } else {
          step = 86400000;
        }
      }

      let tmpStdX = [];
      if (step > 0 && this.mergedIdx.length > 0) {
        for (let i = 0; i < this.mergedIdx.length - 2; i++) {
          let t1 = new Date(this.mergedIdx[i]).getTime();
          let t2 = new Date(this.mergedIdx[i + 1]).getTime();
          while (t1 + step < t2) {
            let tmp = new Date();
            t1 += step;
            tmp.setTime(t1);
            let ts = TimeHelper.convertDate2UniformString(tmp, this.Gran);
            if (this.mergedIdx.indexOf(ts) < 0) {
              this.mergedIdx.push(ts);
            }
          }
        }

        this.mergedIdx.push.apply(this.mergedIdx, tmpStdX);
      }

      this.mergedIdx.sort();
    },

    initLines() {
      // this.initIdx();
      this.lines = [];
      for (let idx in this.Lines) {
        this.lines.push(new Line(this.Lines[idx], this.mergedIdx, this.Gran, this.CustomGran));
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
      this.myChart.on('mousedown',this.onMouseDown);
      this.myChart.on('mouseup',this.onMouseUp);
      
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

          if (!hastime && params.value != null) {
            self.currentTimestamp = params.value[self.lines[i].tsIdx];
            ret += "<div class='col-md-12' style='text-align:left'><B>" + self.currentTimestamp + "</B>&nbsp;</div>";
            hastime = true;
          }
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
              if (params.value != null) {
                ret +=
                  "<div class='col-md-12'><span style='background-color: " +
                  params.color +
                  ";border-radius: 5px; width: 10px; height: 10px'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" +
                  params.seriesName +
                  ":&nbsp;<B>";
                ret += params.value[self.lines[i].valIdx];
                ret += "</B></div>";
              }
            }
          }
        }
        ret += "</div>";
        return ret;
      };

      if (this.lines.length === 1 && this.MeanTrend) {
        let legends = ["Value", "BaseLine"];
        opt = this.loadSingleLine(this.lines[0], opt, legends, true);
      } else {
        opt = this.loadLines(opt);
      }

      if (this.Zooming) {
        opt.dataZoom = [
          {
            type: "inside",
            xAxisIndex: 0,
            filterMode: "empty"
          },
          {
            type: "slider",
            xAxisIndex: 0,
            filterMode: "empty"
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

      this.myChart.setOption(opt);

      // this.myChart.setTheme({color: ['#DB8B3C', '#F2B87C', '#A9CAA2', '#0076D5', '#005A68', '#009BC1', '#79C7A5', '#E3CD9E', '#00BFAD']});
      // this.myChart.refresh();
      this.refresh += 1;
    },

    loadSingleLine(line, opt, legend, boundary = false) {
      let min = Number.MAX_VALUE;
      let max = Number.MIN_VALUE;

      opt = this.loadOneLine(line, opt, this.currentTab);
      opt.legend.data.push.apply(opt.legend.data, legend);
      for (let i = 0; i < legend.length; i++) {
        if (i === 0 || legend[i] === "BaseLine") {
          opt.legend.selected[legend[i]] = true;
        } else {
          opt.legend.selected[legend[i]] = false;
        }
      }
      opt.legend.selected[legend[0]] = true;
      for (let key in legend) {
        switch (legend[key]) {
          case "BaseLine": {
            let mean = $.extend(true, {}, serieOption);
            let tmp = line.getMeanTrendLine(this.MeanTrend, this.HighlightTS);
            for (let idx in tmp) {
              mean.data.push(tmp[idx]);
              min = min > tmp[idx] && tmp[idx] != null ? tmp[idx] : min;
              max = max < tmp[idx] && tmp[idx] != null ? tmp[idx] : max;
            }

            mean.name = legend[key];
            opt.series.push(mean);
            break;
          }
          case "Value":
          default: {
            break;
          }
        }
      }

      let gap = Number(((max - min) / 20).toFixed(2));

      if (min < Number.MAX_VALUE) {
        opt.yAxis[0].min = Math.round((min - gap) * 100 - 1) * 1.0 / 100.0;
        opt.yAxis[0].max = Math.round((max + gap) * 100 + 1) * 1.0 / 100.0;
      }
      if (opt.yAxis[0].min > min) {
        opt.yAxis[0].min = min;
      }

      if (opt.yAxis[0].max < max) {
        opt.yAxis[0].max = max;
      }
      return opt;
    },

    loadOneLine(line, opt, legend, currentTab = "Value") {
      opt.legend.data.push(legend);
      // opt.xAxis[0].data = this.mergedIdx;
      switch (currentTab) {
        case "Value":
        default: {
          let original = $.extend(true, {}, serieOption);
          if (line.isOutlier()) {
            original = $.extend(true, {}, outlierOption);
          }
          let tmp = line.getLineData();
          original.data = tmp.data;
          let mark = $.extend(true, {}, markOption);
          let markret = line.getHightlightMark(this.HighlightTS, line.line.id.isOutlier);
          mark.data = markret["mark"];
          let markArea = {
            data: [
              [
                {
                  name: "Window",
                  xAxis: this.windowStartFrom.replace("+00:00", "Z")
                },
                {
                  xAxis: this.HighlightTS
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
          original.markPoint = mark;
          original.name = legend;

          opt.series.push(original);
          break;
        }
      }
      return opt;
    },
    loadLines(opt) {
      for (let idx in this.lines) {
        let legend = this.lines[idx].getIdLegend();
        if (this.lines[idx]["line"].id.legendName) {
          legend = this.lines[idx]["line"].id.legendName + legend ? `(${legend})` : "";
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
      dataView: {
        readOnly: false,
        title: "Data View",
        lang: ["Data View", "Close", "Refresh"]
      },
      saveAsImage: { show: true, title: "save as Image" },
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
        }
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
      }
      // data: []
    }
  ],
  grid: [
    {
      left: 20,
      right: 20,
      top: "50",
      bottom: "8%",
      containLabel: true
    }
  ],
  yAxis: [
    {
      name: "Value",
      type: "log",
      splitNumber: 3,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      }
    }
  ],
  series: []
};

let outlierOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 16,
  showSymbol: false,
  showAllSymbol: true,
  connectNulls: false,
  data: [],
  markPoint: null,
  markLine: null
};

let serieOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 12,
  showSymbol: false,
  showAllSymbol: true,
  connectNulls: false,
  lineStyle: { normal: { type: "dotted" } },
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
  connectNulls: true,
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
  lineStyle: { normal: { type: "dotted", color: "#17233d" } },
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
