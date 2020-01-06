export const onboardHintText = {
  DatafeedType: "Where your metrics are stored.",
  Granularity: "The interval between consecutive data points in a time series.",
  IOTGranularity: "The interval between consecutive data points in a time series. If you want to select 1 min as interval, please contact kensho team.",
  StartTime: "Start date for data ingestion.",
  DisplayName: "Name to be used on UI (instead of original column name).",
  IsTimestamp:
    "Timestamp in selected column are used as the timestamp of measures. If omitted, ingestion timestamp is used. Note: At most one column can be specified as timestamp.",
  IsDimension:
    "One or more categorical values whose combination identifies a particular univariate time series, for example, country, language, tenant. Note: A datafeed can have no Dimension specified.",
  IsMeasure:
    "A numeric value of a time series, for example, count, DAU, revenue. One or more columns can be selected as Measure.",
  ChooseAs: `
  IsTimestamp:
    "Timestamps in the selected column will be used as the timestamp of measures. If omitted, the timestamp of ingestion will be used. At most one column can be specified as Timestamp.",
  IsDimension:
    "One or more categorical values whose combination identifies a particular univariate time series, for example, country, language, tenant. Note: A datafeed can have no Dimension specified.",
  IsMeasure: 
    "A numeric value of a time series, for example, count, DAU, revenue. One or more columns can be selected as Measure.",
  `,
  GracePeriod:
    "A datafeed is considered as not available if no data is ingested from the source within the grace period specified from the time the datafeed starts ingestion. An alert is triggered in this case.",
  AutoSnooze:
    "When set to zero, each timestamp with ‘Not Available’ triggers an alert. When a setting other than zero is specified, continuous timestamps after the first timestamp with ‘not available’ are NOT triggered according to the the setting specified.",
  MaxIngestionPerMinute:
    "Set this parameter if data source supports limited concurrency. Otherwise leave as default setting.",
  ConvertToTemplate:
    "Converts a Structure stream absolute path to required template path.",
  EnableStringMeasure:
    "Some datafeeds use string to store metric values instead of a numeric one. Note: If this option is checked ensure the string can be parsed as double type.",
  Verify:
    "Load a schema from a data source using the timestamp specified by Start Time.",
  IngestionTimeOffset:
    "By default, data with timestamp T is ingested at the time of T + Granularity. For example, the ingestion start time for data marked as Monday would be Tuesday UTC 0 am. By setting a positive number (>0), ingestion of data is delayed accordingly. A negative number (<0) is also allowed."
};

export const firstTimeUserGuideText = {
  addDatafeed: "Onboard your metric data to Kensho from various sources, one source with specific query corresponds to one datafeed.",
  datafeeds: "After onboarding, view/update all datafeeds that you have permission.",
  anomalyEval: "Evaluate our anomaly detection algorithm by uploading data in CSV format.",
  anomalyIncidents: "View all anomaly incidents detected from your metrics, with rich diagnostic insights.",
  dashboard: "Customize business oriented dashboard to keep on track of anything important.",
  favorite: "All favorited time series can be viewed under hook that applied to the metrics.",
  forecasting: "View time series with forecasting capability enabled and also add new series.",
  Hooks: "Apply hook to you metrics to receive timely alerts through email/IcM/OSP…"

}

export function getSampleCode(isMultiLine, type) {
  let res = "";
  if (isMultiLine == 0) {
    switch (Number(type)) {
      case 1: {
        res =
          "https://cosmos09.osdinfra.net/cosmos/searchDM/local/projects/AIA/V2/Cortana/COA/Event/%Y/%m/Verify_Cooked_Daily_EventLog_%Y_%m_%d_Original.ss";
        break;
      }
      case 2: {
        res = `Data Source=odspadwsrv.database.windows.net;Integrated Security=False;Connect Timeout=15;Encrypt=True;TrustServerCertificate=False;Authentication="Active Directory Integrated";ApplicationIntent=ReadWrite;MultiSubnetFailover=False;Initial Catalog=ODC;`;
        break;
      }
      case 3: {
        res = `https://cosmos09.osdinfra.net/cosmos/searchDM/`;
        break;
      }
      case 4: {
        res = `Data Source=CortanaMetrics2;Initial Catalog=CortanaAllUpImpressionUDM`;
        break;
      }
      case 11: {
        res = `Data Source=https://kustolab.kusto.windows.net:443;Initial Catalog="KenshoSample";AAD Federated Security=True`;
        break;
      }
    }
  } else if (isMultiLine == 1) {
    switch (Number(type)) {
      case 2: {
        res = `(For Daily @StartTime will be the 2017-07-01 00:00:00, @EndTime will be 2017-07-01 23:59:59. For Hourly@StartTime will be the 2017-07-01 00:00:00, @EndTime will be 2017-07-01 00:59:59)
            select StartDate, JobStatusId, COUNT(*) AS JobNumber from IngestionJobs WHERE and StartDate >=@StartTime and StartDate < @EndTime GROUP BY JobStatusId`;
        break;
      }
      case 3: {
        res = `# DECLARE StartDate string ="@@StartTimeDate@@"; //2017-07-01 00:00:00
          # DECLARE EndDate string = "@@EndTimeDate@@"; // For daily, it will be 2017-07-01 23:59:59, for hourly it will be 2017-07-01 00:59:59.It is always the start of next period.
          SELECT __date AS Day, Dataset, Action_Name, ClientIdNum, DeviceIdNum, AnidNum,ActionNum
          FROM
          (
              SSTREAM
              SPARSE STREAMSET @"/local/projects/AIA/V1/Cortana/Metrics/Monitoring/ActionName/"
              PATTERN @"%Y/%m/ActionName_%Y_%m_%d.ss"
              RANGE __date = [@StartDate, @StartDate]
          )
          WHERE Action_IsActiveAction == true
          ;
          OUTPUT TO CONSOLE;`;
        break;
      }
      case 4: {
        res = `WITH SET [date] AS { [Date].[Calendar Time].[Date].&[@StartTime]: [Date].[Calendar Time].[Date].&[@StartTime]}
        SELECT NON EMPTY { [Measures].[DSQ], [Measures].[ImpressionCount], [Measures].[ImpressionsEngagedWith],
        [Measures].[ImpressionsWithClicks], [Measures].[TasksTotal], [Measures].[Volume] } ON COLUMNS,
        NON EMPTY
        { ([InputMethod].[InputMethod].ALLMEMBERS * [Scenario].[Scenario].ALLMEMBERS * [IsInternalUser].ALLMEMBERS * [Market].[Market].ALLMEMBERS * [OSFamily].[OSFamily].ALLMEMBERS * [date] ) } DIMENSION PROPERTIES
        MEMBER_CAPTION, MEMBER_UNIQUE_NAME ON ROWS FROM [CortanaAllUpImpression]`;
        break;
      }
      case 11: {
        res = `let StartDateTime = datetime(@StartTime);
        let EndDateTime = StartDateTime + 1d;
        SampleTable
        | where Timestamp >= StartDateTime and Timestamp < EndDateTime | project Timestamp, Market, RPM`;
        break;
      }
    }
  }
  return res;
}
