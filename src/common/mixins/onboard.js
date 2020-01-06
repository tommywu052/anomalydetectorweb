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
        if (v.chooseAs == "dimensions" && v.columnType !== "string") {
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
        if (originalName == "EventHub") return;
        else if (originalName == "Cosmos") {
          displayName = "Cosmos";
          orderIndex = "01";
        } else if (originalName == "iScope") {
          displayName = "iScope";
          orderIndex = "02";
        } else if (originalName == "SqlServer") {
          displayName = "SQL Server (+ Azure SQL)";
          orderIndex = "03";
        } else if (originalName == "Cube") {
          displayName = "SQL Cube (+ Azure Analysis)";
          orderIndex = "04";
        } else if (originalName == "Kusto") {
          displayName = "Kusto (+ Aria)";
          orderIndex = "05";
        } else if (originalName == "Mdm") {
          displayName = "Geneva MDM";
          orderIndex = "06";
        } else if (originalName == "AzureBlob") {
          displayName = "Azure Blob (JSON file)";
          orderIndex = "10";
        } else if (originalName == "KVP") {
          displayName = "Cosmos (KVP file)";
          orderIndex = "11";
        } else if (originalName == "AzureTable") {
          displayName = "Azure Table";
          orderIndex = "12";
        } else if (originalName == "InfluxDB") {
          displayName = "InfluxDB (InfluxQL)";
          orderIndex = "20";
        } else if (originalName == "xCard") {
          displayName = "xCard";
          orderIndex = "21";
        } else if (originalName == "MySql") {
          displayName = "MySQL";
          orderIndex = "22";
        } else if (originalName == "PostgreSql") {
          displayName = "PostgreSQL";
          orderIndex = "23";
        } else if (originalName == "JSON") {
          displayName = "JSON";
          orderIndex = "24";
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
        return this.OnboardTypes[this.formItem.onboardTypeId]["template"][
          "parameters"
        ];
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
        for (let v of this.step2FormItem) {//make sure that only one timestamp is chosen
          if (v.chooseAs === "timestampColumn" && v.columnName !== colname) {
            v.chooseAs = "Ignore";
          }
        }


      }

    },

    willdisableTimestamp(v) {
      if (
        ["string", "datetime", "datetimeoffset"].indexOf(v.columnType) === -1
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
    willdisableDimension(v) {
      if (this.sampleData) {
        //Value of Dimension [AcisEndpoint] is too long
        return v.isDisableDimension === true;
      } else {
        return false;
      }
    },
    willdisableMeasure(v) {
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
        this.formItem.onboardTypeId = "1";
        this.formItem.granType = "4";
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
              this.schemaWarning = "Please check your query to ensure there is only one slice (one day, one hour, … according to the granularity) of time-series data returned. Please use @StartTime or @EndTime placeholder if necessary.";
            } else {
              this.schemaWarning = "";
            }
            if (this.formItem.granType == 8 && this.formItem.customGran < 300) {
              this.$Message.error(
                "Custom granularity less than 5 minutes is not supported at this time. Please try to do aggregations or contact us."
              );
              return;
            }
            this.isShowingSpin1 = true;
            let data = {
              DateTimeFrom: TimeHelper.getFormattedUTCDateString(
                this.formItem.date
              ),
              GranularityType: this.formItem.granType,
              OnboardType: this.formItem.onboardTypeId,
              CustomGran: this.formItem.customGran,
              ...this.step1Para
            };

            if (this.formItem.granType >= 5) {
              data.DateTimeFrom = TimeHelper.getFormattedUTCDateHourString(
                this.formItem.date
              );
            }
            let url = "";
            _.forOwn(this.getOnboardPlainTypes, (v, i) => {
              if (this.formItem.onboardTypeId === v["id"]) {
                data.OnboardType = v["name"];
                url = v["apiAddress"];
                return;
              }
            });
            this.schemaError = "";

            DatafeedApi.loadSchema(url, data)
              .then(res => {
                if (!res.data) {
                  this.$Notice.error({
                    title: "Error",
                    desc: `There is no column in this datafeed!`
                  });
                  return Promise.reject();
                }
                let startTime = new Date(data.DateTimeFrom).getTime();
                let t1 = TimeHelper.getAdHintT1(data.GranularityType);
                let t2 = TimeHelper.getAdHintT2(data.GranularityType);
                let granId = data.GranularityType;
                let custom = data.CustomGran;
                let now = TimeHelper.alignTimeBy(
                  moment().toDate(),
                  data.GranularityType
                ).getTime();
                let timstampOfLastestData =
                  now - TimeHelper.getGranMilliseconds(granId);
                let GRAN = TimeHelper.getGranText(data.GranularityType);
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
                let schemas = res.data.Schemas;
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
                    this.errMultiTimestamp = `Column '${verifiedRes.timestampDupErrCols.toString()}' cannot be set as Timestamp, since multiple timestamp values returned from your query. Kensho uses this query to ingest data from source every time, please make sure only one timestamp returned within configured granularity.`;
                  } else {
                    this.errMultiTimestamp = "";
                  }
                  if (verifiedRes.dimLengthErrCols.length > 0) {
                    this.errDimColStrlenAbove256 = `Column '${verifiedRes.dimLengthErrCols.toString()}.' cannot be set as Dimension, since the value contains more than 256 characters.`
                  } else {
                    this.errDimColStrlenAbove256 = "";
                  }
                }
              })
              .then(res => {
                this.$ariaLogger.log("VerifyAndGetSchema_success");
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
        if (curColType === 'string' || curColType === 'datetime') {
          if (sampleData.length>0 && !isNaN(Date.parse(sampleData[0][curColName]))) {
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
      this.errExistIgnoredCol='';
      this.$refs["datafeedName"].validate(valid => {
        this.$refs["step2Form"].validate(valid => {
          if (this.step2FormValid === false) {
            this.showingMeasureAlert = true;
            return;
          } else if (valid === true) {
            this.toggleModalSpin = true;
            let timestampColumn = "";
            let metrics = [];
            let dimensions = [];
            let displayColNames = [];
            let cantIgnore = '';
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
                case "Ignore":
                  if(v.columnType === "string" && this.toggleStringMeasure!==true) {

                    if (cantIgnore != '') {
                      cantIgnore += ', ';
                    }

                    cantIgnore += v.columnName;
                  }
                  
                  break;
              }

              if (cantIgnore) {
                this.errExistIgnoredCol = 
                  `Columns [ ` + cantIgnore + ` ] cannot be ignored. Kensho will not perform aggregation on the 'Ignored' column. 
                  only non-String columns can be ignored. You can: 
                              
                              Option 1. Select these columns as dimensions if they are indeed dimensions you want. 
                              Option 2. Aggregate them or remove them from the query.
                              Option 3. For columns you are sure not to create multiple values for selected dimension combo, 
                                        such as 'PartitionKey' of Azure Table or others which will keep same value within one timestamp, 
                                        select 'Enable string measure' to skip the check.
                              
                              For AzureTable, if 'PartitionKey' is aligned with the timestamp, do not use it as a dimension. 
                              So in that case you need to check 'Enable string measure' to proceed. `;
                this.toggleModalSpin = false;
                return;
              }

              displayColNames.push([
                v.columnName,
                v.displayName ? v.displayName : v.columnName
              ]);
            }

            let pageFormItem = this.formItem;

            let para = {
              datafeedName: pageFormItem.datafeedName,
              dataStartFrom: TimeHelper.getFormattedUTCDateString(
                pageFormItem.date
              ),
              datasourceTypeId: pageFormItem.onboardTypeId,
              gracePeriodInSeconds: pageFormItem.gracePeriodInSeconds,
              granTypeId: pageFormItem.granType,
              customInSeconds: pageFormItem.customGran,
              parameterList: this.step1Para,
              timestampColumn: timestampColumn,
              metrics: metrics,
              dimensions: dimensions,
              displayColNames: _.fromPairs(displayColNames),
              scheduleIngestionDelayInSeconds: pageFormItem.ingestionTimeOffset,
              maxPullJobCountInMinute: pageFormItem.maxIngestionPerMinute,
              allUpIdentification: pageFormItem.allUpIdentification
            };

            if (pageFormItem.granType >= 5) {
              para.dataStartFrom = TimeHelper.getFormattedUTCDateHourString(
                pageFormItem.date
              );
            }
            let p = null;
            if (!this.isEditing) {
              p = DatafeedApi.createDatafeed(para)
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
              p = DatafeedApi.updateDatafeed({
                datafeedId: this.para.datafeedId,
                ...para
              })
                .then(res => {
                  this.close();
                  this.$Message.success(`Successfully updated.`);
                  this.$emit("updateSuccessful");
                  return res;
                })
                .finally(res => {
                  this.toggleModalSpin = false;
                });
            }

            if (this.isEditing === true && this.formItem.subId) {
              p = p.then(res => {
                return DatafeedApi.updateSubscription({
                  subscriptionId: this.formItem.subId,
                  delayParameter: { autoSnooze: this.formItem.autoSnooze },
                  hookList: this.formItem.hookIds
                });
              });
            } else if (!this.isEditing) {
              p = p.then(res => {
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
            p.then((res)=>{
              this.$ariaLogger.log("SubmitOnboarding_success");
              return res;
            })
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
      errExistIgnoredCol:'',
      formItem: {
        date: TimeHelper.getDefaultStartTimeForOnboard(4, 300),
        onboardTypeId: "",
        granType: "",
        datafeedName: "",
        gracePeriodInSeconds: TimeHelper.getDefaultAllowDelay(4),
        maxIngestionPerMinute: -1,
        ingestionTimeOffset: 0,
        customGran: 300,
        autoSnooze: 0,
        hookIds: [],
        allUpIdentification: null
      },
      step1Para: {},
      step2FormItem: [],
      myHooks: [],
      hint: onboardHintText,
      allUpIdentificationRadioText: "",
      step1ParaRules: {
        required: true,
        message: `Please fill the form`,
        trigger: "blur"
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
