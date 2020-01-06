import T from "@/common/TimeHelperM.js";
let localDateToUtcSting = {};
localDateToUtcSting.install = function (Vue, options) {
    Vue.filter("localDateToUtcSting", function (date) {
        return T.localDateToUtcSting(date);
    });
}


export default localDateToUtcSting