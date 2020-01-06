<template>
    <div>
        <div :style="{height: CanvasHeight, width: ChartWidth}">
            <div class="main" :id="CanvasId" :style="{height: ChartHeight, width: ChartWidth}"></div>
        </div>
    </div>
</template>
<script>
import echarts from 'echarts';
import _ from 'lodash';

let option = {
    tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: function(para) {
                let ret = "<span>" + para.name + "</span>";
                return ret;
            }
    },
    series: [
        {
            type: 'pie',

            top: '0%',
            left: '10%',
            bottom: '1%',
            right: '10%',

            symbolSize: function(value, params) {
                if (!value) {
                    return 20;
                }
                else {
                    return 20 * value + 20;
                }
            },
            itemStyle: {
                normal: {
                    borderColor: '#5cadff',
                    borderWidth: 0
                }
            },
            label: {
                normal: {
                    position: 'right',
                    verticalAlign: 'middle',
                    align: 'right',
                    fontSize: 10
                }
            },

            expandAndCollapse: false,
            data: null
        }
    ]
};

export default {
    props: {
        CanvasId: String,
        CanvasHeight: String,
        ChartHeight: String,
        ChartWidth: String,
        Gran: String, // define timetype(yearly, monthly,weekly,dayly,hourly,and seconds(with customgran together))
        CustomGran: Number, 
        Pie: Array, 
        FocusNode: Object
    },
    data() {
        return {
            myChart: null,
            focusNode: null,
            refresh: 1,
            init: false, 
            pie: null,
            totalValue: 1,
        };
    }, 
    mounted() {
        this.pie = this.Pie;
        this.initMaps();
        this.init = true;        
    },
    watch: {
        Pie: {
            handler: function(val, oldVal) {
                if (this.init) {
                    let otherValue = 1.0;
                    this.pie = JSON.parse(JSON.stringify(this.Pie));
                    for(let i = 0; i < this.pie.length; ++i)
                    {
                        otherValue -= this.pie[i].value;
                    }
                    if(otherValue > 0)
                    {
                        let ratio = (otherValue*100).toFixed(2) + "%";
                        this.pie.push({name:'OtherNormal\n'+ratio, value:otherValue, itemStyle:{'color':'#68a6f0'}});
                    }
                    this.initMaps();
                }                
            }, 
            deep: true, 
            immediate: true
        }
    }, 
    methods: {
        initMaps() {
            if (document.getElementById(this.CanvasId)) {
                if (this.myChart) {
                    echarts.dispose(this.myChart);
                }
                this.myChart = echarts.init(document.getElementById(this.CanvasId));
                option.series[0].data = this.pie;
                window.addEventListener('resize', function() {
                    if (this.myChart) {
                        this.myChart.resize();
                    }
        
                }.bind(this));
                this.myChart.setOption(option);
            }
        },
    }
}
</script>
