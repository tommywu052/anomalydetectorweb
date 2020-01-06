import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";

class AlertTraceApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  save(para) {
    let url = `${this.baseUrl}` + "/alerttrace/save";
    return NetworkRequester.httpPost(url, para);
  }
}

const AlertTraceApi = new AlertTraceApiWrapper(CONFIG.CONFIG.alertTraceUrl);

export default AlertTraceApi;
