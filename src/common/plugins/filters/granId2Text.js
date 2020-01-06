let granId2Text = {};
granId2Text.install = function (Vue, options) {
    Vue.filter("granId2Text", function (gran) {
        gran = Number(gran);
        switch (gran) {
            case 1:
                return "Yearly";
            case 2:
                return "Monthly";
            case 3:
                return "Weekly";
            case 4:
                return "Daily";
            case 5:
                return "Hourly";
            case 8:
                return "Custom";
            default:
                return "All";
        }
    });
}


export default granId2Text