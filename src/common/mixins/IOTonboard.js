import DatafeedApi from "@/common/webservices/DatafeedApi.js";
import HookApi from "@/common/webservices/HookApi.js";

import { TimeHelper } from "@/common/TimeHelper.js";
import CodeCard from "@/components/CodeCard";
import { datafeedDetailMapping } from "@/common/Classes.js";
import { onboardHintText, getSampleCode } from "@/common/HintText.js";
import eventHub from "@/common/EventHub.js";
import moment from "moment";
import {
  granUnitMapping,
  granUnitToSecond,
  secondToGranUnit
} from "@/common/DataMappingHelper.js";
import { access } from "fs";

const onboardDatafeedMixin = {
  computed: {
    allUpIdentificationRadioModel: {
      get() {
        if (this.formItem.allUpIdentification === null) {
          return "1";
        } else if (this.formItem.allUpIdentification === "##NULL##awqegp##") {
          return "2";
        } else {
          return "3";
        }
      },
      set: function (newValue) {
        if (newValue === "1") {
          this.formItem.allUpIdentification = null;
        } else if (newValue === "2") {
          this.formItem.allUpIdentification = "##NULL##awqegp##";
        } else {
          this.formItem.allUpIdentification = this.allUpIdentificationRadioText;
        }
      }
    },
    gracePeriodModel: {
      get() {
        return secondToGranUnit(
          this.formItem.gracePeriodInSeconds,
          this.formItem.granType
        );
      },
      set: function (newValue) {
        this.formItem.gracePeriodInSeconds = granUnitToSecond(
          newValue,
          this.formItem.granType
        );
      }
    },
    dateModel: {
      get() {
        return this.formItem.date; // TimeHelper.parseUTCAsLocal();
      }
    },
    ingestionTimeOffsetModel: {
      get() {
        return secondToGranUnit(
          this.formItem.ingestionTimeOffset,
          this.formItem.granType
        );
      },
      set: function (newValue) {
        this.formItem.ingestionTimeOffset = granUnitToSecond(
          newValue,
          this.formItem.granType
        );
      }
    },
    step2FormValid: function () {
      let res = false;
      for (let v of this.step2FormItem) {
        if (v.chooseAs === "metrics") {
          res = true;
          break;
        }
      }
      return res;
    },

    granUnit: function () {
      return granUnitMapping(this.formItem.granType);
    },

    showingDimensionAlert: function () {
      let res = false;
      this.step2FormItem.forEach(v => {
        if (v.chooseAs == "dimensions" && v.columnType !== "String") {
          res = true;
        }
      });
      return res;
    },
    willEnableIntepret: function () {
      if (
        Number(this.formItem.onboardTypeId) === 1 ||
        Number(this.formItem.onboardTypeId) === 9
      ) {
        return true;
      } else {
        return false;
      }
    },
    willEnableCustomGran: function () {
      return this.formItem.granType === "8";
    },
    isShowing: function () {
      return this.willShow;
    },
    getOnboardPlainTypes: function () {
      let res = [];
      let itemMap = new Map();
      _.forOwn(this.OnboardTypes, (v, i) => {
        let originalName = v["template"]["typeName"];
        let displayName = originalName;
        let orderIndex = "99" + originalName;
        if (originalName == "EventHub") {
          displayName = "EventHub";
          orderIndex = "01";
        } else {
            return;
        }
        itemMap.set(orderIndex, {
            id: i,
            name: originalName,
            displayName: displayName
          });
      });

      var itemMapAsc = new Map([...itemMap.entries()].sort());
      itemMapAsc.forEach(item => {
        res.push(item);
      });

      return res;
    },
    paraList: function () {
      if (!_.isEmpty(this.OnboardTypes) && this.formItem.onboardTypeId) {
        let paraList = this.OnboardTypes[this.formItem.onboardTypeId]["template"]["parameters"];
        return paraList.filter(item=> {
            return item.parameterName != "aggreType" && item.parameterName != "startTime";
        });
      } else {
        return [];
      }
    },

    isDisabledStep1: function () {
      return this.currentStep !== 1;
    },
    isDisabledStep2: function () {
      return this.currentStep !== 2;
    }
  },
  watch: {
    // para: function(v) {
    //   if (v && this.isEditing) {
    //     this.formItem = Object.assign({}, datafeedDetailMapping(v, 0));
    //     this.step1Para = Object.assign({}, datafeedDetailMapping(v, 1));
    //     this.step2FormItem = datafeedDetailMapping(v, 2);
    //     // this.$set(this.formItem, );
    //     // this.$set(this.step1Para, datafeedDetailMapping(v, 1));
    //     // this.$set(this.step2FormItem, datafeedDetailMapping(v, 2));
    //   }
    // }
  },

  methods: {
    dateChanged(newDateStr, newDate) {
      this.formItem.date = TimeHelper.parseLocalAsUtc(newDateStr);
    },
    onRadioGroupChanged(colval, val) {
      let colname = colval["columnName"];
      if (val === "timestampColumn") {
        colval["displayName"] = colname;
        for (let v of this.step2FormItem) {//make sure that only one timestamp is chosen
          if (v.chooseAs === "timestampColumn" && v.columnName !== colname) {
            v.chooseAs = "Ignore";
          }
        }


      }

    },
    isDisplayNameDisable(v, i) {
      if(i == 0)
        return true;
      if (v.chooseAs === "timestampColumn")
        return true;
      else 
        return false;
    },
    willdisableTimestamp(v, i) {
      if(i == 0)
      {
        return true;
      } 
      if (
        ["String", "datetime", "datetimeoffset"].indexOf(v.columnType) === -1
      ) {
        return true;
      }
      else if (this.sampleData) {
        return v.isDisableTimestamp === true;
      }
      else {
        return false;
      }
    },
    willdisableDimension(v, i) {
      if (this.sampleData) {
        //Value of Dimension [AcisEndpoint] is too long
        return v.isDisableDimension === true;
      } else {
        return false;
      }
    },
    willdisableMeasure(v, i) {
      if(i == 0)
      {
        return true;
      } 
      if (this.toggleStringMeasure === false) {
        if (this.sampleData) {
          return this.checkPreviewData(v.columnName, this.sampleData);
        } else {
          return v.columnType === "string";
        }
      } else {
        return false;
      }
    },
    willdisableIgnore(v, i){
      if(i == 0)
      {
        return true;
      }
      else
      {
        return false;
      }
    },
    checkPreviewData(colName, sampleData) {
      let res = false;
      for (let v of sampleData) {
        if (Number.isNaN(_.toNumber(v[colName]))) {
          res = true;
          break;
        }
      }
      return res;
    },
    fixDisplayName(name) {
      return name
        .replace(/[\s\t\f\r\n\/:\,]*/g, "")
        .replace(".[MEMBER_CAPTION]", "")
        .replace(".[MEMBER_UNIQUE_NAME]", ".Uniname")
        .replace(/[^a-zA-Z0-9_\[\](){}]/g, "");
    },
    onBlurCustomGran: function () {
      if (
        this.formItem.customGran < 60 ||
        !_.isNumber(this.formItem.customGran)
      ) {
        this.formItem.customGran = 60;
      } else {
        this.formItem.customGran = Math.floor(this.formItem.customGran);
      }
    },
    reset: function () {
      this.currentStep = 1;
      this.$refs["step2Form"].resetFields();
      this.$refs["step1Form"].resetFields();
      this.$refs["step1Para"].resetFields();
      this.step1Para = {};
      this.step2FormItem = [];
    },
    getSampleCode: getSampleCode,
    close: function () {
      this.$emit("update:willShow", false);
    },
    editStep1: function () {
      this.currentStep = 1;
    },
    intepret: function (params) {
      this.$ariaLogger.log("IntepretTemplate_click");
      for (let i in this.step1Para) {
        let val = this.step1Para[i];

        if (
          Number(this.formItem.onboardTypeId) === 1 ||
          Number(this.formItem.onboardTypeId) === 9
        ) {
          val = val.replace(
            /\/(\d{4})(\/)(\d{1,2})(\/)(\d{1,2})/g,
            "/%Y/%m/%d"
          );
          val = val.replace(/\/(\d{4})(\/)(\d{1,2})(\/)/g, "/%Y/%m/");
          val = val.replace(
            /(\d{4})(_)(\d{1,2})(_)(\d{1,2})(_)(\d{1,2})/g,
            "%Y_%m_%d_%h"
          );
          val = val.replace(/(\d{4})(_)(\d{1,2})(_)(\d{1,2})/g, "%Y_%m_%d");
          val = val.replace(/(\d{4})(_)(\d{1,2})/g, "%Y_%m");
          val = val.replace(
            /(\d{4})(-)(\d{1,2})(-)(\d{1,2})(-)(\d{1,2})/g,
            "%Y-%m-%d-%h"
          );
          val = val.replace(/(\d{4})(-)(\d{1,2})(-)(\d{1,2})/g, "%Y-%m-%d");
          val = val.replace(/(\d{4})(-)(\d{1,2})/g, "%Y-%m");
        }

        this.step1Para[i] = val;
      }
    },
    onVisibleChange: function (visible) {
      this.$emit("update:willShow", visible);
      if (visible === true) {
        this.beforeShowing();
      }
    },
    onGranChanged: function (value) {
      // if (Number(value) < 5) {
      //   this.formItem.date = TimeHelper.getUtcOneMonthAgo();
      // } else {
      //   this.formItem.date = TimeHelper.getUtcOneWeekAgo();
      // }
      this.formItem.date = TimeHelper.getDefaultStartTimeForOnboard(
        value,
        this.formItem.customGran
      );
      this.formItem.gracePeriodInSeconds = TimeHelper.getDefaultAllowDelay(
        Number(value),
        this.formItem.customGran
      );
    },
    beforeShowing: function () {
      if (this.isEditing === true) {
        this.currentStep = 2;
        this.formItem = Object.assign({}, datafeedDetailMapping(this.para, 0));
        this.formItem.date = TimeHelper.parseUTCAsLocal(this.formItem.date);
        this.step1Para = Object.assign({}, datafeedDetailMapping(this.para, 1));
        this.step2FormItem = datafeedDetailMapping(this.para, 2);
        this.initHooks();
      } else {
        this.reset();
        this.formItem.onboardTypeId = "17";
        this.formItem.granType = "8";
      }
      const msg = this.$Message.loading({
        content: "Loading...",
        duration: 0
      });
      DatafeedApi.getListGranType().then(res => {
        this.granTypeOptions = res.data;
      });
      DatafeedApi.getListOnboardType().then(res => {
        this.OnboardTypes = res.data;
        msg();
      });
    },
    onboardTypeChanged: function (value) {
      this.$refs["step1Para"].resetFields();
      let paraList = this.paraList;
      this.step1Para = {};
      for (let v of paraList) {
        this.$set(this.step1Para, v.parameterName, "");
      }
    },

    queryTimeVerify: function (onboardTypeId, para) {
      const onboardTypeIds = ['2', '3', '4', '11', '12', '13', '14', '16'];
      let res = true;
      if (onboardTypeIds.indexOf(onboardTypeId) > -1) {
        if (onboardTypeId == 3) {//special for 
          if (para['Script'].toLowerCase().indexOf('@starttime') < 0 &&
            para['Script'].toLowerCase().indexOf('@endtime') < 0) {
            res = false;
          }
        }
        else {
          if (para['Query'].toLowerCase().indexOf('@starttime') < 0 &&
            para['Query'].toLowerCase().indexOf('@endtime') < 0) {
            res = false;
          }
        }
      }

      return res;
    },

    resetSample() {

    },

    duplicateReservedWord:function(v, i)
    { 
      if (this.showingMeasureAlert === true) {
        return i > 0 && v['displayName'] == "aggreType" || v['displayName'] == "enqueuedTime" || v['displayName'] == "defaultMeasure";
      } else {
        return i > 0 && v['displayName'] == "aggreType" || v['displayName'] == "enqueuedTime";
      }  
    },

    containsDuplicateReservedWord: function()
    {
      for(let i = 1; i < this.step2FormItem.length; ++i)
      {
        if(this.duplicateReservedWord(this.step2FormItem[i], i))
        {
          return true;
        }
      }
      return false;
    },

    submitStep1: function () {
      this.$ariaLogger.log("VerifyAndGetSchema_click");
      this.sampleCols = [];
      this.sampleData = [];
      this.$refs["step1Para"]
        .validate(valid => {
          if (valid === true) {
            return valid;
          }
        })
        .then(valid => {
          if (valid) {
            if (this.queryTimeVerify(this.formItem.onboardTypeId, this.step1Para) === false) {
              this.schemaWarning = "Please check your query to ensure there is only one slice (one day, one hour, � according to the granularity) of time-series data returned. Please use @StartTime or @EndTime placeholder if necessary.";
            } else {
              this.schemaWarning = "";
            }
            this.isShowingSpin1 = true;
            let data = {
              dateTimeFrom: TimeHelper.getFormattedUTCDateString(
                this.formItem.date
              ),
              onboardType: this.formItem.onboardTypeId,
              granularityType: this.formItem.granType,
              customGran: this.formItem.customGran,
              ...this.step1Para
            };

            if (this.formItem.granType >= 5) {
              data.dateTimeFrom = TimeHelper.getFormattedUTCDateHourString(
                this.formItem.date
              );
            }
            // let url = "";
            _.forOwn(this.getOnboardPlainTypes, (v, i) => {
              if (this.formItem.onboardTypeId === v["id"]) {
                data.onboardType = v["name"];
                // url = v["apiAddress"];
                return;
              }
            });
            this.schemaError = "";

            DatafeedApi.loadIOTSchema(data)
              .then(res => {
                if (!res.data) {
                  this.$Notice.error({
                    title: "Error",
                    desc: `There is no column in this datafeed!`
                  });
                  return Promise.reject();
                }
                let startTime = new Date(data.dateTimeFrom).getTime();
                let t1 = TimeHelper.getAdHintT1(data.granularityType);
                let t2 = TimeHelper.getAdHintT2(data.granularityType);
                let granId = data.granularityType;
                let custom = data.customGran;
                let now = TimeHelper.alignTimeBy(
                  moment().toDate(),
                  data.granularityType
                ).getTime();
                let timstampOfLastestData =
                  now - TimeHelper.getGranMilliseconds(granId);
                let GRAN = TimeHelper.getGranText(data.granularityType);
                let txt =
                  granId == 8
                    ? `For metrics with granularity of ${custom} seconds`
                    : `For ${GRAN} metrics`;

                if (startTime + t1 > timstampOfLastestData) {
                  let earlierThanTxt = moment(timstampOfLastestData - t1)
                    .utcOffset(0)
                    .format();
                  let willStartAtTxt = moment(startTime + t1)
                    .utcOffset(0)
                    .format();
                  let nowTxt = moment(timstampOfLastestData)
                    .utcOffset(0)
                    .format();

                  this.$Notice.info({
                    title: "Info",
                    desc: `${txt}, smart anomaly detection will start when Kensho get data of ${willStartAtTxt}. To get the result of the latest data ${nowTxt}, you may try a start time earlier than ${earlierThanTxt}.`,
                    ...this.GLOBAL.infoNoticeConfig
                  });
                } else if (startTime + t2 < now) {
                  let startFrom = moment(now - t2)
                    .utcOffset(0)
                    .format();
                  this.$Notice.info({
                    title: "Info",
                    desc: `${txt}, smart anomaly detection will start from ${startFrom}.`,
                    ...this.GLOBAL.infoNoticeConfig
                  });
                }
                let schemas = res.data.schemas;

                this.sampleCols = [];
                this.sampleData = res.data.PreviewData;

                //                this.sampleData[0]['LogDate']='2018-01-01';

                for (let key in schemas) {
                  this.sampleCols.push({
                    title: key,
                    key: key
                  });
                }
                if (this.isEditing === true) {
                  let diff = _.xor(
                    _.union(
                      this.step2FormItem.map(v => v.columnName),
                      _.keys(schemas)
                    ),
                    _.keys(schemas)
                  );
                  if (
                    diff.length !== 0
                  ) {
                    this.schemaError = `The new schemas did not match the original ones. Please onboard a new datafeed if you need. The new schemas are missing following columns:${JSON.stringify(
                      diff
                    )}`;
                  } else {
                    let diff=  _.xor(_.keys(schemas),this.step2FormItem.map(v => v.columnName));
                    for (let key in schemas) {
                      if(diff.indexOf(key)>-1){
                        this.step2FormItem.push({
                          columnName: key,
                          displayName: this.fixDisplayName(key),
                          columnType: schemas[key],
                          chooseAs: "Ignore",
                          isNewCol:true
                        });   
                      }
                    }
                    this.$Message.success("Successfully verified");
                    this.currentStep = 2;
                  }
                } else {
                  this.$Message.success("Successfully verified");
                  this.step2FormItem = [];
                  this.currentStep = 2;
                  this.step2FormItem.push({
                    columnName: "aggreate_type",
                    displayName: "aggreType",
                    columnType: "String",
                    chooseAs: "dimensions"
                  });
                  for (let key in schemas) {
                    this.step2FormItem.push({
                      columnName: key,
                      displayName: this.fixDisplayName(key),
                      columnType: schemas[key],
                      chooseAs: "Ignore"
                    });
                  }
                  let verifiedRes = this.verifySampleData(this.step2FormItem, this.sampleData)
                  if (verifiedRes.timestampDupErrCols.length > 0) {
                    this.errMultiTimestamp = `Below columns cannot be Timestamp, ${verifiedRes.timestampDupErrCols.toString()}. There are multiple values returned from given source.`;
                  } else {
                    this.errMultiTimestamp = "";
                  }
                  if (verifiedRes.dimLengthErrCols.length > 0) {
                    this.errDimColStrlenAbove256 = `Below columns cannot be Dimension, ${verifiedRes.dimLengthErrCols.toString()}. Some values contain more than 256 characters.`
                  } else {
                    this.errDimColStrlenAbove256 = "";
                  }
                }
              })
              .then(res => {
                return this.initHooks();
              })
              .catch(err => {
                this.schemaError = err.ErrorMessage;
              })
              .finally(res => {
                this.isShowingSpin1 = false;
              });
          }
        });
    },

    verifySampleData: function (step2FormItem, sampleData) {
      let timestampDupErrCols = [];
      let dimLengthErrCols = [];
      step2FormItem.forEach(v => {
        let curColType = v.columnType;
        let curColName = v.columnName;
        if (curColType === 'string') {
          if (!isNaN(Date.parse(sampleData[0][curColName]))) {
            let res = false;
            sampleData.reduce((acc, cur) => {
              if (acc[curColName] !== cur[curColName]) {
                res = true;
              }

              return cur;
            })
            if (res == true) {
              timestampDupErrCols.push(curColName);
              v.isDisableTimestamp = true;
            }
          } else {
            v.isDisableTimestamp = true;
            let res = false;
            sampleData.forEach((v, i) => {
              if (v[curColName].length >= 256) {
                res = true;
              }
            })
            if (res == true) {
              dimLengthErrCols.push(curColName);
              v.isDisableDimension = true;
            }
          }
        }
      })
      return { timestampDupErrCols: timestampDupErrCols, dimLengthErrCols: dimLengthErrCols }
    },

    initHooks: function () {
      return HookApi.getMyHook(2).then(res => {
        this.myHooks = res.data;
        if (this.isEditing === true) {
        } else {
          if (res.data.length > 0) {
            this.formItem.hookIds = [res.data[0].hookId];
          }
        }

        return res;
      });
    },

    submitAll: function () {
      this.$ariaLogger.log("SubmitOnboarding_click");
      this.showingMeasureAlert = false;
      this.$refs["datafeedName"].validate(valid => {
        this.$refs["step2Form"].validate(valid => {
          if(this.containsDuplicateReservedWord())
          {
            return;
          }
          //if no measure was chosen, use defaultMeasure
          if (this.step2FormValid === false) {
            this.showingMeasureAlert = true;

            // return;
          }
          if (valid === true) {
            this.toggleModalSpin = true;
            let timestampColumn = "";
            let metrics = [];
            let dimensions = [];
            let displayColNames = [];
            for (let v of this.step2FormItem) {
              v.displayName = this.fixDisplayName(v.displayName);
              switch (v.chooseAs) {
                case "timestampColumn":
                  timestampColumn = v.columnName;
                  break;
                case "metrics":
                  metrics.push(v.columnName);
                  break;
                case "dimensions":
                  dimensions.push(v.columnName);
                  break;
              }
              displayColNames.push([
                v.columnName,
                v.displayName ? v.displayName : v.columnName
              ]);
            }

            let parameterList = this.step1Para;
            parameterList.aggreType = [];
            metrics.forEach(item => {
                let aggreTypeItem = {};
                aggreTypeItem.name = item;
                aggreTypeItem.measureName = item;
                aggreTypeItem.timeWindow = this.formItem.customGran / 60;
                parameterList.aggreType.push(aggreTypeItem);
            });
            parameterList.aggreType = JSON.stringify(parameterList.aggreType);
            parameterList.startTime = TimeHelper.getFormattedUTCDateHourString(
                this.formItem.date
            );

            let pageFormItem = this.formItem;

            // let para = {
            //   user: window.userInfo.userEmail,
            // }
            let para = {
              datafeedName: pageFormItem.datafeedName,
              metrics: metrics,
              dimensions: dimensions,
              displayColNames: _.fromPairs(displayColNames),
              dataStartFrom: TimeHelper.getFormattedUTCDateString(
                pageFormItem.date
              ),
              datasourceTypeId: pageFormItem.onboardTypeId,
              parameterList: parameterList,
              timestampColumn: timestampColumn,
              detectionStartTime: TimeHelper.getFormattedUTCDateString(
                pageFormItem.date
              ),
              gracePeriodInSeconds: pageFormItem.gracePeriodInSeconds,
              granTypeId: pageFormItem.granType,
              customInSeconds: pageFormItem.customGran,
            };

            if (pageFormItem.granType >= 5) {
              para.dataStartFrom = TimeHelper.getFormattedUTCDateHourString(
                pageFormItem.date
              );
            }
            let p = null;
            if (!this.isEditing) {
              console.log(JSON.stringify(para));
              p = DatafeedApi.createIOTDatafeed(para)
                .then(res => {
                  this.close();
                  this.$Message.success(
                    `Successfully created. Datafeed Id: ${
                    res.data["datafeedId"]
                    }`
                  );
                  eventHub.$emit("refreshDatafeedList");
                  this.$router.push({ name: "datafeed" });
                  return res;
                })
                .finally(res => {
                  this.toggleModalSpin = false;
                });
            } else {
              // p = DatafeedApi.updateDatafeed({
              //   datafeedId: this.para.datafeedId,
              //   ...para
              // })
              //   .then(res => {
              //   //   this.close();
              //     this.$Message.success(`Successfully updated.`);
              //     this.$emit("updateSuccessful");
              //     return res;
              //   })
              //   .finally(res => {
              //     this.toggleModalSpin = false;
              //   });
            }

            if (this.isEditing === true && this.formItem.subId) {
              p.then(res => {
                return DatafeedApi.updateSubscription({
                  subscriptionId: this.formItem.subId,
                  delayParameter: { autoSnooze: this.formItem.autoSnooze },
                  hookList: this.formItem.hookIds
                });
              });
            } else if (!this.isEditing) {
              p.then(res => {
                return DatafeedApi.subscribeDatafeed({
                  datafeedId: res.data.datafeedId,
                  hookIds: this.formItem.hookIds,
                  subscriptionParam: {
                    autoSnooze: this.formItem.autoSnooze,
                    needAlert: true,
                    needReport: true
                  }
                });
              });
            }
          }
        });
      });
    }
  },
  data: function () {
    return {
      isShowingSpin1: false,
      currentStep: 1,
      granTypeOptions: {},
      OnboardTypes: {},
      schemaError: "",
      schemaWarning: "",
      showSetting: false,
      toggleStringMeasure: false,
      toggleModalSpin: false,
      showingMeasureAlert: false,
      errMultiTimestamp: '',
      errDimColStrlenAbove256: '',
      formItem: {
        date: TimeHelper.getDefaultStartTimeForOnboard(4, 300),
        onboardTypeId: 17,
        granType: 8,
        datafeedName: "",
        gracePeriodInSeconds: TimeHelper.getDefaultAllowDelay(4),
        maxIngestionPerMinute: -1,
        ingestionTimeOffset: 0,
        customGran: 300,
        autoSnooze: 0,
        hookIds: [],
        allUpIdentification: null
      },
      granMinOptions: [5, 10, 15],
      step1Para: {
      },
      step2FormItem: [],
      myHooks: [],
      hint: onboardHintText,
      allUpIdentificationRadioText: "",
      step1ParaRules: {
        required: true,
        message: `Please fill the form`,
        trigger: "blur",
        // partitionNum: [
        //   {
        //     type: "number",
        //     required: true,
        //     message: `Please fill the form`,
        //     trigger: "blur"
        //   },
        //   {
        //     type: "number",
        //     message: `-1 or [1,100]`,
        //     min: -1,
        //     max: 100,
        //     trigger: "blur"
        //   }
        // ]
      },
      // step1FormRules: {
      //   customGran: [
      //     {
      //       type: "number",
      //       required: true,
      //       message: `Please fill the form`,
      //       trigger: "blur"
      //     },
      //     {
      //       type: "number",
      //       message: `>=300`,
      //       min: 300,
      //       trigger: "blur"
      //     }
      //   ]
      // },
      sampleCols: null,
      sampleData: null,
      step2FormRules: {
        maxIngestionPerMinute: [
          {
            type: "number",
            required: true,
            message: `Please input a valid number.`,
            trigger: "blur"
          },
          {
            type: "number",
            message: `-1 or [1,100]`,
            min: -1,
            max: 100,
            trigger: "blur"
          }
        ],
        gracePeriodInSeconds: [
          {
            type: "number",
            required: true,
            message: `Please input a valid number.`,
            trigger: "blur"
          },
          {
            type: "number",
            message: `Please input a number between [0,1000000].`,
            min: 0,
            max: 1000000,
            trigger: "blur"
          }
        ],
        ingestionTimeOffset: [
          {
            type: "number",
            required: true,
            message: `Please input a valid number.`,
            trigger: "blur"
          },
          {
            type: "number",
            message: `Please input a number between [-1000000,1000000].`,
            min: -1000000,
            max: 1000000,
            trigger: "blur"
          }
        ],
        autoSnooze: [
          {
            type: "number",
            required: true,
            message: `Please input a valid number.`,
            trigger: "blur"
          },
          {
            type: "number",
            message: `Please input a number between [0,10000].`,
            min: 0,
            max: 10000,
            trigger: "blur"
          }
        ]
      },
      datafeedNameRules: {
        datafeedName: {
          required: true,
          message: `Please fill the datafeed name. `,
          trigger: "blur"
        }
      }
    };
  }
};
export default onboardDatafeedMixin;
