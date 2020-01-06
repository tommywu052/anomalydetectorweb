<template>
    <div>
        <div :style="{height: CanvasHeight, width: ChartWidth, margin: 'auto'}">
            <div class="main" :id="CanvasId" :style="{height: ChartHeight, width: ChartWidth}"></div>
        </div>
        
    </div>
    
</template>
<script>
import echarts from 'echarts';
import _ from 'lodash';

let option = {
    tooltip: {
        position: 'top'
    },
    visualMap: {
        min: 0,
        max: 5,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: 'top',
        inRange : {   
            color: ['#F22', '#FFA' ] //From smaller to bigger value ->
        }
    },

    calendar: [],
    series: []
};

export default {
    props: {
        CanvasId: String,
        CanvasHeight: String,
        ChartHeight: String,
        ChartWidth: String,
        Gran: String, // define timetype(yearly, monthly,weekly,dayly,hourly,and seconds(with customgran together))
        CustomGran: Number, 
        Calendar: Array
    },
    data() {
        return {
            myChart: null,
            refresh: 1,
            init: false, 
            calendar: null,
            byyear: {}
        };
    }, 
    mounted() {
        if (this.Calendar && this.Calendar.length > 0) {
            this.calendar = JSON.parse(JSON.stringify(this.Calendar));
            this.initMaps();
            this.init = true;   
        }
    },
    watch: {
        Calendar: {
            handler: function(val, oldVal) {
                if (val) {
                    this.calendar = JSON.parse(JSON.stringify(this.Calendar));
                    this.initMaps();
                }
            }, 
            deep: true, 
            immediate: true
        }
    }, 
    methods: {
        initMaps() {
            this.byyear = {};
            option.series = [];
            option.calendar = [];
            if (document.getElementById(this.CanvasId)) {
                if (this.myChart) {
                    echarts.dispose(this.myChart);
                }
                this.myChart = echarts.init(document.getElementById(this.CanvasId));
                window.addEventListener('resize', function() {
                    if (this.myChart) {
                        this.myChart.resize();
                    }
        
                }.bind(this));
                this.myChart.on('click', this.focus);
                this.getVirtulData();
                let idx = 0;
                for (let key in this.byyear) {
                    option.calendar.push({
                        top: idx * 200 + 80,
                        range: key, 
                        cellSize: ['auto', 20]
                    });
                    option.series.push({
                        
                        type: 'heatmap',
                        coordinateSystem: 'calendar', 
                        calendarIndex: idx, 
                        data: this.byyear[key]
                    });
                    idx ++;
                }

                this.myChart.setOption(option);
            }
        },

        focus(param) {

        },

        getVirtulData() {
            let dayTime = 3600 * 24 * 1000;
            let data = [];
            let currentts = echarts.format.formatTime('yyyy-MM-dd', this.calendar[0].timestamp);
            let currentyr = (new Date(this.calendar[0].timestamp)).getUTCFullYear();
            let level = this.calendar[0].level;
            let ts = -1;
            let yr = -1;
            for (let i = 1; i < this.calendar.length; i++) {
                ts = echarts.format.formatTime('yyyy-MM-dd', this.calendar[i].timestamp);
                yr = (new Date(this.calendar[i].timestamp)).getUTCFullYear();
                
                if (ts != currentts) {
                    if (!this.byyear[yr]) {
                        this.byyear[yr] = [];
                    }
                    this.byyear[yr].push([
                        currentts,
                        level
                    ]);
                    currentts = ts;
                    ts = -1;
                    yr = -1;
                    level = this.calendar[i].level;
                }
                else {
                    if (level > this.calendar[i].level) {
                        level = this.calendar[i].level;
                    }
                }
            }
            if (ts != -1) {
                if (!this.byyear[yr]) {
                    this.byyear[yr] = [];
                }
                this.byyear[yr].push([
                        currentts,
                        level
                    ]);
            }
        }
    }
}
</script>
