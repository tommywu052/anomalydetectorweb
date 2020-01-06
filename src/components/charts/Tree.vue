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
import {DimensionHelper} from "@/common/DimensionHelper.js";

let option = {
    tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: function(para) {
                if (!para.data.meta) {
                    return '';
                }

                let point = para.data.meta;
                let ret = '<div>';
                if (point.parentValue != null) {
                    let ratio = (point.point.value * 100.0 / point.parentValue).toFixed(2);
                    ret += "Contribution: <B>" + ratio + '%</B><br/>';
                }
                for (let key in point.dimensions) {
                    let val = DimensionHelper.getDimensionDisplayValueWithGlobal(point.dimensions[key]);
                    ret += '<span>' + key + ': ' + val + '</span><br/>';
                }
                ret += '<span style=\'color: yellow\'>Click the node to load the chart. </span>';
                ret += '</div>';
                return ret;
            }
    },
    series: [
        {
            type: 'tree',

            top: '1%',
            left: '10%',
            bottom: '1%',
            right: '10%',
            symbol: 'circle',

            symbolSize: function(value, params) {
                if (!value) {
                    return 20;
                }
                else {
                    return 10 * value + 20;
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
            data: null,
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
        Tree: Object, 
        FocusNode: Object
    },
    data() {
        return {
            myChart: null,
            focusNode: null,
            refresh: 1,
            init: false, 
            tree: null
        };
    }, 
    mounted() {
        this.tree = JSON.parse(JSON.stringify(this.Tree));
        this.initMaps();
        this.init = true;        
    },
    watch: {
        Tree: {
            handler: function(val, oldVal) {
                if (this.init) {
                    this.tree = JSON.parse(JSON.stringify(this.Tree));
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
                this.focusNode = this.FocusNode;
                if (!this.focusNode) {
                    this.focusNode = this.tree;
                }
                this.myChart = echarts.init(document.getElementById(this.CanvasId));
                option.series[0].data = [this.tree];
                window.addEventListener('resize', function() {
                    if (this.myChart) {
                        this.myChart.resize();
                    }
        
                }.bind(this));
                this.changeFocusNode([this.tree], 0, false);
                this.myChart.setOption(option);
                this.myChart.on('click', this.focus);
            }
        },

        focus(param) {
            let data = param.data;
            this.focusNode = data;
            this.changeFocusNode([this.tree], 0, true);
            this.$emit('ptclick', data);
            option.series[0].data = [this.tree];
            this.myChart.setOption(option, true);
        },
        changeFocusNode(tree, level, updateColor) {
            let hit = false;
            if (!tree || tree.length == 0) {
                return hit;
            }
            let nor = {borderColor: '#6cc1ff', color: '#c1d7f4'};
            let leave =  {borderColor: '#6cc1ff', color: '#ffffff'};
            for (let i = 0; i < tree.length; i++) {
                let node = tree[i];
                let focus = this.focusNode;
                if (focus['level'] === level) {
                    if (focus['seq'] === node['seq']) {
                        // We get the focus node. 
                        if(updateColor)
                        {
                            node['itemStyle'] = node.children.length > 0?nor:leave;
                        }
                        node['collapsed'] = false;
                        hit = true;
                    } else {
                        if(updateColor){
                            node['itemStyle'] = node.children.length > 0?nor:leave;
                        }
                        node['collapsed'] = true;
                    }
                    
                    let childHit = this.changeFocusNode(node['children'], level + 1, updateColor);
                } else if (focus['level'] > level) {
                    let childHit = this.changeFocusNode(node['children'], level + 1, updateColor);
                    if (childHit) {
                        node['collapsed'] = false;
                        if(updateColor){
                            node['itemStyle'] = node.children.length > 0?nor:leave;
                        }
                        hit = true;
                    }
                    else{
                        node['collapsed'] = true;
                        if(updateColor){
                            node['itemStyle'] = node.children.length > 0?nor:leave;
                        }
                    }
                } else if (focus['level'] < level) {
                    node['collapsed'] = true;
                    if(updateColor){
                        node['itemStyle'] = node.children.length > 0?nor:leave;
                    }
                }
            }

            return hit;
        },
    }
}
</script>
