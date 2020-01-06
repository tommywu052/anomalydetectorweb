import {DimensionHelper} from "@/common/DimensionHelper.js";
 
let DimensionFilter={};
DimensionFilter.install = function (Vue, options) {
    window.g_allupIdentification='';
    Vue.prototype.$DimensionHelper = DimensionHelper;
    Vue.filter("dimensionFilter", DimensionHelper.getDimensionDisplayValueWithGlobal);
}


export default DimensionFilter