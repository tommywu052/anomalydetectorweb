import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";
import { dimensions, series } from "@/mocks/metricMock";

class MetricsApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }
  getCsvAnomalyEntire(para, endpoint, key) {
    let url = endpoint;
    if (!endpoint) {
      url = this.baseUrl + "/anomalydetector/v1.0/timeseries/entire/detect";
    }
    
    return NetworkRequester.httpPost(url, para, false, null, null, key);
  }

  getCsvAnomalyLast(para, endpoint, key) {
    let url = endpoint;
    if (!endpoint) {
      url = this.baseUrl + "/anomalydetector/v1.0/timeseries/last/detect";
    }

    return NetworkRequester.httpPost(url, para, false, null, null, key);
  }
}

const MetricApi = new MetricsApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default MetricApi;
