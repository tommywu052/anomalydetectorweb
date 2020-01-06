import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";
import { ariaLogger } from "@/main.js";
class AlertApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }

  getDetailedSmartAlert(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/alert_report_query";
    return NetworkRequester.httpPost(url, para);
    // return Promise.resolve(incidentDetail);
  }

  getSmartAlertList(para) {
    let url =
      `${this.baseUrl}` + "/api/FrontDoor/alert_report_list_alert_summary";
    return NetworkRequester.httpPost(url, para);
  }

  loadIncident(para) {
    ariaLogger.log("IncidentTree_Requested");
    let url = `${this.baseUrl}` + "/api/FrontDoor/alert_report_get_incident";
    return NetworkRequester.httpPost(url, para).then(res => {
      ariaLogger.log("IncidentTree_Loaded");
      return res;
    });
  }

  loadIncidentGroup(para) {
    ariaLogger.log("AnomalyGrouping_Requested");
    let url = `${this.baseUrl}` + "/api/FrontDoor/alert_report_get_similar_anomalies";
    return NetworkRequester.httpPost(url, para).then(res => {
      ariaLogger.log("AnomalyGrouping_Loaded");
      return res;
    });
  }
}

const AlertApi = new AlertApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default AlertApi;
