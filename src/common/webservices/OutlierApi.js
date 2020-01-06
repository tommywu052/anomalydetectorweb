import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";

class OutlierApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }

  create(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/create_outlier";
    return NetworkRequester.httpPost(url, para);
  }

  update(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/update_outlier";
    return NetworkRequester.httpPost(url, para);
  }

  updateSeriesGroup(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/update_series_group";
    return NetworkRequester.httpPost(url, para);
  }

  preview(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/preview_outlier";
    return NetworkRequester.httpPost(url, para);
  }

  getOutlierDetails(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_outlier_details";
    return NetworkRequester.httpPost(url, para);
  }

  getMyOutliers(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_my_outliers";
    return NetworkRequester.httpPost(url, para);
  }

  getLatestSuccessTime(para) {
    let url =
      `${this.baseUrl}` + "/api/frontdoor/get_outlier_latest_success_time";
    return NetworkRequester.httpPost(url, para);
  }

  getHistory(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_outlier_history";
    return NetworkRequester.httpPost(url, para);
  }

  delete(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/delete_outlier";
    return NetworkRequester.httpPost(url, para);
  }

  getScheduleStatus(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_outlier_schedule_status";
    return NetworkRequester.httpPost(url, para);
  }
}

const OutlierApi = new OutlierApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default OutlierApi;
