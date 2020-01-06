//used in CreateNewSubModal.vue
export class SubscriptionFormItems {
  subscriptionName;
  subscriptionTypeId;
  subscriptionId;
  subscriptionDescription;
  autoSnooze = 0;
  icmSeverity;
  lowerBound = 0;
  upperBound = 0;
  sensitivity = 95;
  minAlertNumber = 1;
  minAlertRatio = 100;
  anomalyDetectorDirection = "Both";
  anomalyDetectorType = "SmartDetector";
  spikeOnly;
  minAlertSeverity;
  changePercentage = 0;
  changePercentageOver = 0;
  enableMetricAlert = true;
  subscriptionDescription;
  appliedHooks;
  orgHooks;
  metricGuid;

  constructor(metricId) {
    if (metricId) {
      this.metricGuid = metricId;
    }
  }

  setFromPara(value) {
    if (!value) return;
    this.metricGuid = value.subscriptionInfo.metricGuid;
    this.subscriptionName = value.subscriptionInfo.subscriptionName;
    this.subscriptionId = value.subscriptionInfo.subscriptionId;
    this.subscriptionDescription = value.subscriptionInfo
      .subscriptionDescription
      ? value.subscriptionInfo.subscriptionDescription
      : "";
    this.appliedHooks = value.hookList
      ? _.map(value.hookList, v => {
          return v.hookId;
        })
      : [];
    this.orgHooks = this.appliedHooks;
    this.subscriptionTypeId =
      value.subscriptionInfo.subscriptionParam.anomalyDetectorType;
    this.autoSnooze = value.subscriptionInfo.subscriptionParam.autoSnooze;
    this.icmSeverity = value.subscriptionInfo.subscriptionParam.icmSeverity;
    this.lowerBound = value.subscriptionInfo.subscriptionParam.lowerBound;
    this.upperBound = value.subscriptionInfo.subscriptionParam.upperBound;
    this.sensitivity = value.subscriptionInfo.subscriptionParam.sensitivity;
    this.minAlertNumber =
      value.subscriptionInfo.subscriptionParam.minAlertNumber;
    this.minAlertRatio = value.subscriptionInfo.subscriptionParam.minAlertRatio;
    this.anomalyDetectorDirection =
      value.subscriptionInfo.subscriptionParam.anomalyDetectorDirection;
    this.anomalyDetectorType =
      value.subscriptionInfo.subscriptionParam.anomalyDetectorType;
    this.spikeOnly = value.subscriptionInfo.subscriptionParam.spikeOnly;
    this.minAlertSeverity =
      value.subscriptionInfo.subscriptionParam.minAlertSeverity;
    this.changePercentage =
      value.subscriptionInfo.subscriptionParam.changePercentage;
    this.changePercentageOver =
      value.subscriptionInfo.subscriptionParam.changePercentageOver;
    this.enableMetricAlert = value.subscriptionInfo.enableMetricAlert;
  }

  getCreateSubMetricPara() {
    return {
      metricGuid: this.metricGuid,
      hookIds: this.appliedHooks,
      enableMetricAlert: this.enableMetricAlert,
      subscriptionTypeId: 1,
      subscriptionName: this.subscriptionName,
      subscriptionDescription: this.subscriptionDescription,
      subscriptionParam: {
        autoSnooze: this.autoSnooze,
        icmSeverity: this.icmSeverity,
        lowerBound: this.lowerBound,
        upperBound: this.upperBound,
        sensitivity: this.sensitivity,
        minAlertNumber: this.minAlertNumber,
        minAlertRatio: this.minAlertRatio,
        anomalyDetectorDirection: this.anomalyDetectorDirection,
        anomalyDetectorType: this.anomalyDetectorType,
        spikeOnly: this.spikeOnly,
        minAlertSeverity: this.minAlertSeverity,
        changePercentage: this.changePercentage,
        changePercentageOver: this.changePercentageOver,
        alertEnabled: this.alertEnabled
      }
    };
  }

  getUpdateSubMetricPara() {
    return {
      subscriptionId: this.subscriptionId,
      hookList: this.appliedHooks,
      // addHookList: _.difference(this.appliedHooks, this.orgHooks),
      // removeHookList: _.difference(this.orgHooks, this.appliedHooks),

      subscriptionName: this.subscriptionName,
      subscriptionDescription: this.subscriptionDescription,
      anomalyParameter: {
        enableMetricAlert: this.enableMetricAlert,
        subscriptionModeId: "1",
        subscriptionParam: {
          autoSnooze: this.autoSnooze,
          icmSeverity: this.icmSeverity,
          lowerBound: this.lowerBound,
          upperBound: this.upperBound,
          sensitivity: this.sensitivity,
          minAlertNumber: this.minAlertNumber,
          minAlertRatio: this.minAlertRatio,
          anomalyDetectorDirection: this.anomalyDetectorDirection,
          anomalyDetectorType: this.anomalyDetectorType,
          spikeOnly: this.spikeOnly,
          minAlertSeverity: this.minAlertSeverity,
          changePercentage: this.changePercentage,
          changePercentageOver: this.changePercentageOver,
          alertEnabled: this.alertEnabled
        }
      }
    };
  }
}

export function datafeedDetailMapping(orgData, para) {
  if (para === 0) {
    //formItem
    return {
      date: new Date(orgData.startFrom),
      //onboardTypeId: orgData.dataSourceType,
      onboardTypeId: `${orgData.dataSourceTypeId}`,
      granType: `${orgData.granTypeId}`,
      datafeedName: orgData.datafeedName,
      gracePeriodInSeconds: orgData.gracePeriodInSeconds,
      maxIngestionPerMinute: orgData.maxPullJobCountInMinute,
      ingestionTimeOffset: orgData.scheduleIngestionDelayedInSeconds,
      customGran: orgData.customInSeconds,
      allUpIdentification: orgData.allUpIdentification,
      subId: orgData.subId,
      autoSnooze: orgData.autoSnooze ? orgData.autoSnooze : 1,
      hookIds: orgData.appliedHookIds ? orgData.appliedHookIds : []
    };
  } else if (para === 1) {
    //step1para
    return JSON.parse(orgData.dataSourceParameter);
  } else if (para === 2) {
    let res = [];
    if (orgData.timestampColumn) {
      res.push({
        chooseAs: "timestampColumn",
        columnName: orgData.timestampColumn,
        columnType: "string",
        displayName: orgData.timestampColumn
      });
    }
    for (let i in orgData.dimensions) {
      res.push({
        chooseAs: "dimensions",
        columnName: i,
        columnType: "string",
        displayName: orgData.dimensions[i]
      });
    }

    for (let v of orgData.metrics) {
      res.push({
        chooseAs: "metrics",
        columnName: v.name,
        columnType: "string",
        displayName: v.displayName
      });
    }
    return res;
  }
}
