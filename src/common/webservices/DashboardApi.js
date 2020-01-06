import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";
class DashboardApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }

  getMyDashboards(data) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/list_dashboards";

    return NetworkRequester.httpPost(url, data);
  }

  getDashboard(data) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/get_dashboard_detail";

    return NetworkRequester.httpPost(url, data);
  }

  updateDashboard(para) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/update_dashboard";
    return NetworkRequester.httpPost(url, para);
  }


  createDashboard(para) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/create_dashboard";
    return NetworkRequester.httpPost(url, para);
  }

  addDashboardUsers(para) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/add_dashboard_users";
    return NetworkRequester.httpPost(url, para);
  }

  removeDashboardUsers(para) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/remove_dashboard_users";
    return NetworkRequester.httpPost(url, para);
  }

  getMyDashboardsTotalNum(para) {
    let url = `${this.baseUrl}` + "/api/Frontdoor/get_dashboard_total_count";
    return NetworkRequester.httpPost(url, para);  
  }
}

const DashboardApi = new DashboardApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default DashboardApi;
