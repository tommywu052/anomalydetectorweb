import moment from "moment";
function granToTimespanMapping(gran, custom) {
    const DAY = 86400000;
    switch (gran * 1) {
        case 1:
            return DAY * 365;
        case 2:
            return DAY * 30;
        case 3:
            return DAY * 7;
        case 4:
            return DAY * 1;
        case 5:
            return DAY / 24;
        case 8:
            return custom;
        default:
            return custom;
    }
}
export default class TimeHelperM {

    static utcStingToLocalDate(str) {
        if (typeof str === 'string') {
            return moment(str).utc().utcOffset(moment().utcOffset(), true).toDate();
        } else {
            throw new Error('Only accept string')
        }

    }

    static localDateToUtcSting(date) {
        if (_.isDate(date)) {
            return moment(date).utcOffset(0, true).format();
        } else {
            throw new Error('Only accept date object')
        }
    }

    static utcNow(gran) {
        let utcNowDate = this.utcStingToLocalDate(this.utcNowStr());
        if (gran) {
            utcNowDate = this.alignDateByGran(utcNowDate, gran)
        }
        return utcNowDate;
    }

    static utcNowStr() {
        return moment().utc().format();
    }

    static getTime(date) {
        return new Date(this.localDateToUtcSting(date)).getTime();
    }

    static alignDateByGran(date, granId) {
        let unit = '';
        if (granId > 4) {
            unit = 'day';
        } else {
            unit = 'hour';
        }
        return moment(date).startOf(unit).toDate();
    }

    //deprecated
    static getGapbyGran(gran) {
        switch (gran) {
            case 1:
                return 4 * 365 * 86400000;
            case 2:
                return 365 * 86400000;
            case 3:
                return 16 * 7 * 86400000;
            case 4:
                return 28 * 86400000;
            case 5:
                return 28 * 86400000;
            case 8:
                return 2 * 86400000;
            default:
                return 24 * 86400000;
        }
    }

    //deprecated
    static getDefaultStartTime(end, gran) {
        let res = new Date();
        res.setTime(end.getTime() - this.getGapbyGran(gran));
        return res;
    }

    static offsetDateByGran(date, gran, customGran, offset, minAbsValInSec = 0) {
        let granValue = granToTimespanMapping(gran, customGran)
        let resTimestamp = date.getTime() + (offset == 0 ? 0 : ((Math.abs(offset * granValue) < minAbsValInSec * 1000 ? (offset / Math.abs(offset)) * minAbsValInSec * 1000 : offset * granValue)));
        let res= new Date();
        res.setTime(resTimestamp);
        return res;
    }
}
