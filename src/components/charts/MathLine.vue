<template>
  <div>
    <span style="display:none">{{refresh}}</span>
    <div class="col-md-12 tab-body" :style="{height: CanvasHeight + 'px', width: ChartWidth}">
      <div v-if="LineTree" class="main" :id="CanvasId" :style="{height: ChartHeight + 'px', width: ChartWidth}" 
          >
      </div>
      <div v-if="!LineTree" class="main" :style="{height: ChartHeight + 'px', width: ChartWidth}">
        <div style="margin-top: 35%; width: 100%; text-align: center;font-size :16px; color: #939393">
          No data!
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import echarts from "echarts";
import _ from "lodash";
import $ from "jquery";
import { TimeHelper } from "@/common/TimeHelper.js";
export default {
  props: {
    LineTree: Object,
    CanvasHeight: String,
    ChartHeight: String,
    ChartWidth: String,
    CanvasId: String,
    HighlightTS: String,
  },
  data() {
    return {
      myChart: null,
      changeTune: null, 
      finalData: null,
      refresh: 0, 
      highTS: 0
    };
  },
  watch: {

  },

  created() {
    this.changeTune = _.debounce(function() {
        this.initLines();
    }, 200);
  },
  mounted() {
    this.initLines();
    this.$watch("LineTree", onLinesChanged, { immediate: true, deep: true });
    this.$watch("HighlightTS", onHighLightChange, { immediate: true, deep: true });
    
    function onLinesChanged(val, oldVal) {
      if (this.LineTree && val && oldVal) {
        this.changeTune();
      }
    }

    function onHighLightChange(val, oldVal) {
      this.changeTune();
    }
  },
  methods: {
    calc(treeNode) {
        if (treeNode.points != null) {
            return treeNode.points;
        }
        let left = this.calc(treeNode.left);
        if (left == null || left.length == 0) {
            return [];
        }
        let right = this.calc(treeNode.right);
        // Offset is in second, it defines how the right ts should be offset based on the left. 
        let offset = treeNode.offset;
        
        let ago;
        let c = 1;
        switch(treeNode.offsetUnit) {
            case 'day':
                offset = offset * 86400000;
                break;
            case 'month':
                ago = new Date(left[0][0]);
                
                for (let i = 0; i < Math.abs(offset); i++) {
                  ago = TimeHelper.getUtcOneMonthAgo(ago);
                
                }
                
                if (offset != 0) {
                  c = offset / Math.abs(offset);
                }

                offset = new Date(left[0][0]).getTime() - ago.getTime();
                offset *= c;
                break;
            case 'year':
                ago = new Date(left[0][0]);
                for (let i = 0; i < Math.abs(offset); i++) {
                  ago = TimeHelper.getUtcOneYearAgo(ago);
                }
                let c = 1;
                if (offset != 0) {
                  c = offset / Math.abs(offset);
                }                
                offset = new Date(left[0][0]).getTime() - ago.getTime();
                offset *= c;
               
                break;
        }

        let hTS = 0;
        if (this.HighlightTS) {
          hTS = (new Date(this.HighlightTS)).getTime();
        }
        let ret = [];
        let rightPos = 0;
        for (let i = 0; i < left.length; i++) {
            let leftTs = (new Date(left[i][0])).getTime();
            let rightTs;
            if (right.length == rightPos) {
                ret.push([leftTs, null]);
                continue;
            }
            else {
                rightTs = (new Date(right[rightPos][0])).getTime();
            }

            if (leftTs + offset == rightTs) {
                if (leftTs == hTS) {
                  this.highTS = leftTs;
                }

                let result = null;
                switch (treeNode.op) {
                    case 'add': 
                        result = left[i][1] + right[rightPos][1];
                        break;
                    case 'minus':
                        result = left[i][1] - right[rightPos][1];
                        break;
                    case 'mul': 
                        result = left[i][1] * right[rightPos][1];
                        break;
                    case 'div':
                        if (right[rightPos][1] != 0) {
                            result = left[i][1] * 1.0 / right[rightPos][1];
                        }
                        else {
                            result = null;
                        }
                        break;
                    case 'delta': 
                        result = left[i][1] - right[rightPos][1];
                    break;
                    case 'percentage':
 
                        if (right[rightPos][1] != 0) {
                            result = (left[i][1] - right[rightPos][1]) * 1.0 / right[rightPos][1];
                        }
                        else {
                            result = null;
                        }

                    break;
                }                
                rightPos ++;
                ret.push([leftTs, result]);
            } else if (leftTs + offset < rightTs) {
                ret.push([leftTs, null]);
            } else {
                rightPos ++;
                i --;
            }
        }

        return ret;
    },
    initLines() {
      this.finalData = this.calc(this.LineTree);

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
        ret += TimeHelper.convertDate2FullUniformString(new Date(paramslist[0].value[0]), 8);
        ret +=
            "<div class='col-md-12'><span style='background-color: " +
            paramslist[0].color +
            ";border-radius: 5px; width: 10px; height: 10px'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" +
            paramslist[0].seriesName +
            ":&nbsp;<B>";
            ret += paramslist[0].value[1];
        ret += "</B></div>";
        ret += "</div>";
        return ret;
      };

      let result = $.extend(true, {}, serieOption);
      result.data = this.finalData;
      
      if (this.LineTree.highTS) {
        this.highTS = this.LineTree.highTS; 
      }

      if (this.highTS) {
        let mark = $.extend(true, {}, markOption);
        for (let i = 0; i < result.data.length; i++) {       
          if (result.data[i][0] == this.highTS) {
            mark.data = [];
            mark.data.push({
              coord: [result.data[i][0], result.data[i][1]],
              value: result.data[i][1],
              symbol: "arrow",
              symbolSize: 25,
              itemStyle: 
                { normal: { color: "#B55", opacity: 0.85 } }
                
            })
            break;
          }
        }
        result.markPoint = mark;
      }
      
      opt.series.push(result);
      this.myChart.setOption(opt, false);
      this.refresh += 1;
    },
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
      },
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
      type: "value",
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

let serieOption = {
  name: "",
  type: "line",
  symbol: "circle",
  symbolSize: 12,
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
