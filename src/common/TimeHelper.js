import moment from "moment";
export class TimeHelper {
  static getUtcNow() {
    let now = new Date();
    let utcTicks = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    return new Date(utcTicks);
  }

  static getUtcNowForPrediction() {
    let now = new Date(new Date().getTime() + 86400000 * 14);
    let utcTicks = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    return new Date(utcTicks);
  }
  static getGranStepInMs(gran, customInSec) {
    let step = 0;
    if (gran === 4) {
      step = 86400000;
    } else if (gran === 5) {
      step = 3600000;
    } else if (gran === 3) {
      step = 86400000 * 7;
    } else if (gran === 8 && customInSec) {
      step = customInSec * 1000;
    }

    return step;
  }
  static getUtcOneWeekAgo() {
    let now = this.getUtcNow();
    now.setTime(now.getTime() - 604800000);
    return now;
  }

  static getUtcDaysAgo(day) {
    let now = this.getUtcNow();
    now.setTime(now.getTime() - day * 86400000);
    return now;
  }

  static getUtcOneMonthAgo(from = null) {
    let now;
    if (from) {
      now = new Date(from);
    } else {
      now = new Date();
    }
    let utcTicks = Date.UTC(
      now.getUTCMonth() ? now.getUTCFullYear() : now.getUTCFullYear() - 1,
      now.getUTCMonth() ? now.getUTCMonth() - 1 : 11,
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    return new Date(utcTicks);
  }

  static getUtcOneYearAgo(from = null) {
    let now;
    if (from) {
      now = new Date(from);
    } else {
      now = new Date();
    }
    let utcTicks = Date.UTC(
      now.getUTCFullYear() - 1,
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    return new Date(utcTicks);
  }
  static getRequestDateString(date) {
    let postfix = "T00:00:00.000Z";
    let strmon =
      date.getUTCMonth() < 9
        ? "0" + (date.getUTCMonth() + 1)
        : date.getUTCMonth() + 1;
    let strday =
      date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();
    let ret = date.getUTCFullYear() + "-" + strmon + "-" + strday + postfix;
    return ret;
  }

  static convertDate2UTCString(ts) {
    let month =
      ts.getUTCMonth() > 8
        ? ts.getUTCMonth() + 1
        : "0" + "" + (ts.getUTCMonth() + 1);
    let day =
      ts.getUTCDate() > 9 ? ts.getUTCDate() : "0" + "" + ts.getUTCDate();
    let hour =
      ts.getUTCHours() > 9 ? ts.getUTCHours() : "0" + "" + ts.getUTCHours();
    let minute =
      ts.getUTCMinutes() > 9
        ? ts.getUTCMinutes()
        : "0" + "" + ts.getUTCMinutes();

    return (
      ts.getUTCFullYear() +
      "-" +
      month +
      "-" +
      day +
      "T" +
      hour +
      ":" +
      minute +
      ":00Z"
    );
  }

  static convertDate2UniformString(ts, granString) {
    let month =
      ts.getUTCMonth() > 8
        ? ts.getUTCMonth() + 1
        : "0" + "" + (ts.getUTCMonth() + 1);
    let day =
      ts.getUTCDate() > 9 ? ts.getUTCDate() : "0" + "" + ts.getUTCDate();
    let hour =
      ts.getUTCHours() > 9 ? ts.getUTCHours() : "0" + "" + ts.getUTCHours();
    let minute =
      ts.getUTCMinutes() > 9
        ? ts.getUTCMinutes()
        : "0" + "" + ts.getUTCMinutes();
    
    if (granString === "Yearly") {
      return ts.getUTCFullYear();
    } else if (granString === "Monthly") {
      return ts.getUTCFullYear() + "-" + month;
    } else if (granString === "Daily" || granString === "Weekly") {
      return ts.getUTCFullYear() + "-" + month + "-" + day;
    } else if (granString === "Hourly") {
      return (
        ts.getUTCFullYear() + "-" + month + "-" + day + "T" + hour + ":00:00Z"
      );
    } else if (granString === "Custom") {
      return (
        ts.getUTCFullYear() +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hour +
        ":" +
        minute +
        ":00Z"
      );
    }
  }
  static convertUniformStringtoFull(ts, granString) {
    if (granString === "Yearly") {
      return ts + "-01-01T00:00:00Z";
    } else if (granString === "Monthly") {
      return ts + "-01T00:00:00Z";
    } else if (granString === "Daily" || granString === "Weekly") {
      return ts + "T00:00:00Z";
    } else if (granString === "Hourly") {
      return ts;
    } else if (granString === "Custom") {
      return ts;
    }
  }

  static parseUTCAsLocal(date) {
    return moment(date)
      .utc()
      .utcOffset(moment().utcOffset(), true)
      .toDate();
  }

  static parseLocalAsUtc(date) {
    return new Date(date);
  }

  static convertDate2FullUniformStringForeceUTC(ts, granId) {
    let gran = Number(granId);
    let month =
      ts.getUTCMonth() > 8
        ? ts.getUTCMonth() + 1
        : "0" + "" + (ts.getUTCMonth() + 1);
    let day =
      ts.getUTCDate() > 9 ? ts.getUTCDate() : "0" + "" + ts.getUTCDate();
    let hour =
      ts.getUTCHours() > 9 ? ts.getUTCHours() : "0" + "" + ts.getUTCHours();
    let minute =
      ts.getUTCMinutes() > 9
        ? ts.getUTCMinutes()
        : "0" + "" + ts.getUTCMinutes();
    if (gran === 1) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 2) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 3 || gran === 4) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 5) {
      return (
        ts.getUTCFullYear() + "-" + month + "-" + day + "T" + hour + ":00:00Z"
      );
    } else if (gran > 5) {
      return (
        ts.getUTCFullYear() +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hour +
        ":" +
        minute +
        ":00Z"
      );
    }
  }

  static convertDate2FullUniformString(ts, granId) {
    let gran = Number(granId);
    let month =
      ts.getUTCMonth() > 8
        ? ts.getUTCMonth() + 1
        : "0" + "" + (ts.getUTCMonth() + 1);
    let day =
      ts.getUTCDate() > 9 ? ts.getUTCDate() : "0" + "" + ts.getUTCDate();
    let hour =
      ts.getUTCHours() > 9 ? ts.getUTCHours() : "0" + "" + ts.getUTCHours();
    let minute =
      ts.getUTCMinutes() > 9
        ? ts.getUTCMinutes()
        : "0" + "" + ts.getUTCMinutes();
    if (gran === 1) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 2) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 3 || gran === 4) {
      return ts.getUTCFullYear() + "-" + month + "-" + day + "T00:00:00Z";
    } else if (gran === 5) {
      return (
        ts.getUTCFullYear() + "-" + month + "-" + day + "T" + hour + ":00:00Z"
      );
    } else if (gran > 5) {
      return (
        ts.getUTCFullYear() +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hour +
        ":" +
        minute +
        ":00Z"
      );
    }
  }
  // Change seen local date to UTC date
  static getFormattedUTCDate(date) {
    let postfix = `T00:00:00.000Z`;
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret = date.getFullYear() + "-" + strmon + "-" + strday + postfix;
    return new Date(ret);
  }

  static getFormattedUTCDateHour(date) {
    let postfix = `:00:00.000Z`;
    let strhr =
      date.getHours() > 9 ? date.getHours() + "" : "0" + date.getHours();
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret =
      date.getFullYear() + "-" + strmon + "-" + strday + "T" + strhr + postfix;
    return new Date(ret);
  }

  static getFormattedUTCDateHourMinute(date) {
    let postfix = `:00.000Z`;
    let strhr =
      date.getHours() > 9 ? date.getHours() + "" : "0" + date.getHours();
    let strmin =
      date.getMinutes() > 9 ? date.getMinutes() + "" : "0" + date.getMinutes();
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret =
      date.getFullYear() +
      "-" +
      strmon +
      "-" +
      strday +
      "T" +
      strhr +
      ":" +
      strmin +
      postfix;
    return new Date(ret);
  }

  static getFormattedUTCDateString(date) {
    let postfix = `T00:00:00.000Z`;
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret = date.getFullYear() + "-" + strmon + "-" + strday + postfix;
    return ret;
  }

  static getFormattedUTCDateStringMinusWeek(date, weeks) {
    let newdate = new Date(date.getTime() - 7 * weeks * 86400000);
    return TimeHelper.getFormattedUTCDateString(newdate);
  }

  static getFormattedUTCDateStringMinusMonth(date, months) {
    let postfix = `T00:00:00.000Z`;

    let newmon = date.getMonth() + 1 - months;
    let year = date.getFullYear();
    if (newmon <= 0) {
      newmon += 12;
      year -= 1;
    }
    let strmon = newmon < 10 ? "0" + newmon : "" + newmon;
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret = year + "-" + strmon + "-" + strday + postfix;
    return ret;
  }

  static getFormattedUTCDateStringMinusYear(date, years) {
    let postfix = `T00:00:00.000Z`;

    let newmon = date.getMonth() + 1;
    let year = date.getFullYear() - 1;
    if (newmon < 0) {
      newmon += 12;
      year -= 1;
    }
    let strmon = newmon < 10 ? "0" + newmon : "" + newmon;
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret = year + "-" + strmon + "-" + strday + postfix;
    return ret;
  }

  static getFormattedUTCDateHourString(date) {
    let postfix = `:00:00.000Z`;
    let strhr =
      date.getHours() > 9 ? date.getHours() + "" : "0" + date.getHours();
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret =
      date.getFullYear() + "-" + strmon + "-" + strday + "T" + strhr + postfix;
    return ret;
  }
  
  static getFormattedOriginalUTCDateHourMinuteString(date) {
    let postfix = `:00.000Z`;
    let strhr =
      date.getUTCHours() > 9 ? date.getUTCHours() + "" : "0" + date.getUTCHours();
    let strmin =
      date.getUTCMinutes() > 9 ? date.getUTCMinutes() + "" : "0" + date.getUTCMinutes();
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getUTCMonth() + 1)
        : "" + (date.getUTCMonth() + 1);
    let strday = date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();
    let ret =
      date.getUTCFullYear() +
      "-" +
      strmon +
      "-" +
      strday +
      "T" +
      strhr +
      ":" +
      strmin +
      postfix;
    return ret;
  }

  static getFormattedUTCDateHourMinuteString(date) {
    let postfix = `:00.000Z`;
    let strhr =
      date.getHours() > 9 ? date.getHours() + "" : "0" + date.getHours();
    let strmin =
      date.getMinutes() > 9 ? date.getMinutes() + "" : "0" + date.getMinutes();
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret =
      date.getFullYear() +
      "-" +
      strmon +
      "-" +
      strday +
      "T" +
      strhr +
      ":" +
      strmin +
      postfix;
    return ret;
  }

  static getFormattedUTCDate(date) {
    if (!date) {
      date = new Date();
    }
    let postfix = `T00:00:00.000Z`;
    let strmon =
      date.getMonth() < 9
        ? "0" + (date.getMonth() + 1)
        : "" + (date.getMonth() + 1);
    let strday = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let ret = date.getFullYear() + "-" + strmon + "-" + strday + postfix;
    return new Date(ret);
  }

  static getFormattedDate(date) {
    return moment(date).format("YYYY-MM-DD");
  }

  static getFormattedUTCString(date) {
    return moment(date).format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
  }

  static getDefaultEndTime(gran, custom, to = null) {
    let now = to ? to : this.getUtcNow();
    switch (gran * 1) {
      case 1:
        return new Date(now.getTime() + 365 * 86400000);
      case 2:
        return new Date(now.getTime() + 31 * 86400000);
      case 3:
        return new Date(now.getTime() + 7 * 86400000);
      case 4:
        return new Date(now.getTime() + 86400000);
      case 5:
        return new Date(now.getTime() + 3600000);
      case 8:
        return new Date(now.getTime() + 86400000 + 1000 * custom);
      default:
        return new Date(now.getTime() + 3 * 86400000);
    }
  }

  static getDefaultStartTimeForOnboard(gran, custom, to = null) {
    let now = null;
    if (to) {
      now = to;
    } else {
      if (gran > 4) {
        now = moment()
          .startOf("hour")
          .toDate();
      } else {
        now = moment()
          .startOf("day")
          .toDate();
      }
    }

    switch (gran * 1) {
      case 1:
        return new Date(now.getTime() - 12 * 365 * 86400000);
      case 2:
        return new Date(now.getTime() - 365 * 86400000);
      case 3:
        return new Date(now.getTime() - 98 * 86400000);
      case 4:
        return new Date(now.getTime() - 30 * 86400000);
      case 5:
        return new Date(now.getTime() - 30 * 86400000);
      case 8:
        return new Date(now.getTime() - 2017000 * custom);
      default:
        return new Date(now.getTime() - 3 * 86400000);
    }
  }

  static getDefaultStartTime(gran, custom, to = null) {
    let now = null;
    if (to) {
      now = to;
    } else {
      if (gran > 4) {
        now = moment()
          .startOf("hour")
          .toDate();
      } else {
        now = moment()
          .startOf("day")
          .toDate();
      }
    }

    switch (gran * 1) {
      case 1:
        return new Date(now.getTime() - 12 * 365 * 86400000);
      case 2:
        return new Date(now.getTime() - 365 * 86400000);
      case 3:
        return new Date(now.getTime() - 84 * 86400000);
      case 4:
        return new Date(now.getTime() - 28 * 86400000);
      case 5:
        return new Date(now.getTime() - 14 * 86400000);
      case 8:
        return new Date(now.getTime() - 1000000 * custom);
      default:
        return new Date(now.getTime() - 3 * 86400000);
    }
  }

  static isInCalculatedSpan(startTime, lastSuccessTime, gran, custom) {
    const DAY = 86400000;
    const HOUR = DAY / 24;
    let st = new Date(startTime);
    let et = new Date(lastSuccessTime);
    let spanLength = et.getTime() - st.getTime();
    switch (gran * 1) {
      case 1:
        return spanLength > 12 * 365 * DAY;
      case 2:
        return spanLength > 24 * 30 * DAY;
      case 3:
        return spanLength > 12 * 7 * DAY;
      case 4:
        return spanLength > 28 * DAY;
      case 5:
        return spanLength > 28 * DAY;
      case 8:
        return spanLength > 14 * DAY;
      default:
        return spanLength > 29 * DAY;
    }
  }

  static getCalculatedSpanStartTimeString(gran, custom) {
    this.convertDate2FullUniformString;
    const DAY = 86400000;
    const HOUR = DAY / 24;
    let nowAligned = this.alignTimeBy(new Date()).getTime();
    let res = new Date();
    function granMapping(gran) {
      switch (gran * 1) {
        case 1:
          return 12 * 365 * DAY;
        case 2:
          return 24 * 30 * DAY;
        case 3:
          return 12 * 7 * DAY;
        case 4:
          return 28 * DAY;
        case 5:
          return 28 * DAY;
        case 8:
          return 2 * DAY;
      }
    }

    res.setTime(nowAligned - granMapping(gran));
    return this.getFormattedUTCString(res);
  }
  static getAdHintT1(gran,custom) {
    const DAY = 86400000;
    const HOUR = 3600;//seconds
    switch (gran * 1) {
      case 1:
        return 12 * 365 * DAY;
      case 2:
        return 24 * 30 * DAY;
      case 3:
        return 12 * 7 * DAY;
      case 4:
        return 28 * DAY;
      case 5:
        return 28 * DAY;
      case 8:
        if(custom>=HOUR){
          return 28 * DAY
        }else{
          return 2 * DAY;
        }
    }
  }

  static getAdHintT2(gran) {
    const DAY = 86400000;
    switch (gran * 1) {
      case 1:
        return 6 * 365 * DAY;
      case 2:
        return 12 * 30 * DAY;
      case 3:
        return 6 * 7 * DAY;
      case 4:
        return 28 * DAY;
      case 5:
        return 14 * DAY;
      case 8:
        return 14 * DAY;
    }
  }
  static getAdStartTimeString(timestamp, gran) {
    this.convertDate2FullUniformString;
    const DAY = 86400000;
    const HOUR = DAY / 24;
    let nowAligned = this.alignTimeBy(new Date(timestamp)).getTime();
    let res = new Date();
    function granMapping(gran) {
      switch (gran * 1) {
        case 1:
          return 12 * 365 * DAY;
        case 2:
          return 24 * 30 * DAY;
        case 3:
          return 12 * 7 * DAY;
        case 4:
          return 28 * DAY;
        case 5:
          return 28 * DAY;
        case 8:
          return 2 * DAY;
      }
    }

    res.setTime(nowAligned + granMapping(gran));
    return this.getFormattedUTCString(res);
  }

  static alignTimeBy(time, gran) {
    let m = moment(time).utcOffset(0);
    let res;
    switch (Number(gran)) {
      case 1:
        res = m.startOf("year");
      case 2:
        res = m.startOf("month");
      case 3:
        res = m.startOf("week");
      case 4:
        res = m.startOf("day");
      case 5:
        res = m.startOf("hour");
      case 8:
        res = m.startOf("hour");
    }
    return res.toDate();
  }

  static getAdStartTime(gran, custom, to = null) {
    // function getCustomLoc(custom) {
    //   if (custom < 86400000 / 24) {
    //     return 6;
    //   } else if (custom >= 86400000 / 24 && custom < 86400000) {
    //     return 5;
    //   } else if (custom >= 86400000 && custom < 86400000 * 7) {
    //     return 4;
    //   } else if (custom >= 86400000 * 7 && custom < 86400000 * 30) {
    //     return 3;
    //   } else if (custom >= 86400000 * 30 && custom < 86400000 * 365) {
    //     return 2;
    //   } else {
    //     return 1;
    //   }
    // }
    let now = null;
    if (to) {
      now = to;
    } else {
      if (gran > 4) {
        now = moment()
          .startOf("hour")
          .toDate();
      } else {
        now = moment()
          .startOf("day")
          .toDate();
      }
    }

    switch (gran * 1) {
      case 1:
        return new Date(now.getTime() - 6 * 365 * 86400000);
      case 2:
        return new Date(now.getTime() - 12 * 30 * 86400000);
      case 3:
        return new Date(now.getTime() - 6 * 7 * 86400000);
      case 4:
        return new Date(now.getTime() - 28 * 86400000);
      case 5:
        return new Date(now.getTime() - 14 * 86400000);
      case 8:
        return new Date(now.getTime() - 14 * 86400000);
    }
  }
  static getDefaultShortStartTime(gran, custom, to = null) {
    let now = to ? to : this.getUtcNow();
    switch (gran * 1) {
      case 1:
        return new Date(now.getTime() - 7 * 365 * 86400000);
      case 2:
        return new Date(now.getTime() - 365 * 86400000);
      case 3:
        return new Date(now.getTime() - 84 * 86400000);
      case 4:
        return new Date(now.getTime() - 28 * 86400000);
      case 5:
        return new Date(now.getTime() - 7 * 86400000);
      case 8:
        return new Date(now.getTime() - 1000000 * custom);
      default:
        return new Date(now.getTime() - 3 * 86400000);
    }
  }

  static getDefaultAllowDelay(gran, custom) {
    switch (gran * 1) {
      case 1:
        return 86400 * 365;
      case 2:
        return 86400 * 30;
      case 3:
        return 86400 * 7;
      case 4:
        return 86400 * 1;
      case 5:
        return 3600;
      case 8:
        return custom * 2;
      default:
        return custom * 2;
    }
  }

  static getGapbyGran(gran) {
    switch (gran) {
      case 1:
        return 4 * 365 * 86400000;
      case 2:
        return 365 * 86400000;
      case 3:
        return 16 * 7 * 86400000;
      case 4:
        return 14 * 86400000;
      case 5:
        return 2 * 86400000;
      case 8:
        return 1 * 86400000;
      default:
        return 24 * 86400000;
    }
  }

  static getGranMilliseconds(gran) {
    gran = Number(gran);
    switch (gran) {
      case 1:
        return 365 * 86400000;
      case 2:
        return 30 * 86400000;
      case 3:
        return 7 * 86400000;
      case 4:
        return 86400000;
      case 5:
        return 86400000 / 24;
      case 8:
        return 86400000 / 24;
    }
  }
  static getGranText(gran) {
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
  }
}
