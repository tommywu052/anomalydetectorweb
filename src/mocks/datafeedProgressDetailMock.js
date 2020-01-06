export const datafeedProgressDetailMock = {
  datafeedId: 6499,
  prefix: null,
  datafeedName: "2546 2132131231",
  creator: "shzo@microsoft.com",
  granulity: 4,
  granulityString: "Daily",
  customGran: 0,
  gracePeriodInSeconds: 1.0,
  timestampColumn: "LogDate",
  ingestionProcess: [
    { "2018-08-20": true },
    { "2018-08-21": true },
    { "2018-08-22": true },
    { "2018-08-23": true },
    { "2018-08-24": true },
    { "2018-08-25": true },
    { "2018-08-26": true },
    { "2018-08-27": true },
    { "2018-08-28": true },
    { "2018-08-29": true },
    { "2018-08-30": true },
    { "2018-08-31": true },
    { "2018-09-01": true },
    { "2018-09-02": true },
    { "2018-09-03": true },
    { "2018-09-04": true },
    { "2018-09-05": true },
    { "2018-09-06": true },
    { "2018-09-07": true },
    { "2018-09-08": true },
    { "2018-09-09": true },
    { "2018-09-10": true },
    { "2018-09-11": true },
    { "2018-09-12": true },
    { "2018-09-13": true },
    { "2018-09-14": true },
    { "2018-09-15": true },
    { "2018-09-16": true },
    { "2018-09-17": true },
    { "2018-09-18": true },
    { "2018-09-19": true },
    { "2018-09-20": false, "2018-09-20T00:00:00": false }
  ],
  adProcess: {
    "2018-08-21T00:00:00Z": false,
    "2018-08-22T00:00:00Z": false,
    "2018-08-23T00:00:00Z": false,
    "2018-08-24T00:00:00Z": false,
    "2018-08-25T00:00:00Z": false,
    "2018-08-26T00:00:00Z": false,
    "2018-08-27T00:00:00Z": false,
    "2018-08-28T00:00:00Z": false,
    "2018-08-29T00:00:00Z": false,
    "2018-08-30T00:00:00Z": false,
    "2018-08-31T00:00:00Z": false,
    "2018-09-01T00:00:00Z": false,
    "2018-09-02T00:00:00Z": false,
    "2018-09-03T00:00:00Z": false,
    "2018-09-04T00:00:00Z": false,
    "2018-09-05T00:00:00Z": false,
    "2018-09-06T00:00:00Z": false,
    "2018-09-07T00:00:00Z": false,
    "2018-09-08T00:00:00Z": false,
    "2018-09-09T00:00:00Z": false,
    "2018-09-10T00:00:00Z": false,
    "2018-09-11T00:00:00Z": false,
    "2018-09-12T00:00:00Z": false,
    "2018-09-13T00:00:00Z": false,
    "2018-09-14T00:00:00Z": false,
    "2018-09-15T00:00:00Z": false,
    "2018-09-16T00:00:00Z": false,
    "2018-09-17T00:00:00Z": true,
    "2018-09-18T00:00:00Z": true,
    "2018-09-19T00:00:00Z": true
  },
  createTime: "2018-09-19T14:25:56.07",
  detectStartTime: "2018-09-19T14:25:56.07",
  scheduleIngestionDelayedInSeconds: 0.0,
  maxPullJobCountInMinute: 30.0,
  status: "Active",
  datasourceType: "Cosmos",
  datasourceParameter: {
    DataSource:
      "https://cosmos09.osdinfra.net/cosmos/searchDM/local/projects/AIA/V2/Cortana/COA/Event/%Y/%m/Verify_Cooked_Daily_EventLog_%Y_%m_%d_Original.ss"
  },
  dimensions: ["Tag"],
  narrowDimensions: [],
  metrics: [
    {
      Name: "DeviceIdNum",
      DisplayName: "DeviceIdNum",
      Guid: "6b9aa5f1-389a-4ae7-9305-d2edb03dfcc6",
      Start: "2018-08-20",
      MetricsId: "13570",
      End: "2018-09-19"
    }
  ],
  metricsLight: null,
  admins: ["aaa@111.com", "bbb@111.com"],
  viewers: {},
  lastErrorReason: "",
  lastErrorTS: "0001-01-01T00:00:00"
};
export const datafeedProgressMock = {
  data: {
    status: [
      {
        TimeSeriesIngestion: "NotStarted",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      },
      {
        TimeSeriesIngestion: "Running",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      },
      {
        TimeSeriesIngestion: "Unspecified",
        TimeSeriesIngestionMessage:
          "When an internal error happened, and let user to contact Kensho team for further help.",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      },
      {
        TimeSeriesIngestion: "Failed",
        TimeSeriesIngestionMessage: "Failure by some reason.",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      },
      {
        TimeSeriesIngestion: "Succeeded",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      },
      {
        TimeSeriesIngestion: "Succeeded",
        Timestamp: "yyyy-MM-ddTHH:mm:ss.fffZ"
      }
    ],
    dataFeedUid: "00000000-0000-0000-0000-000000000000",
    startTimestampInclusive: "yyyy-MM-ddTHH:mm:ss.fffZ",
    endTimestampExclusive: "yyyy-MM-ddTHH:mm:ss.fffZ"
  }
};
