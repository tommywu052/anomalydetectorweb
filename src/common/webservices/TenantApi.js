import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";

class TenantApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  createTenant() {
    let url = `${this.baseUrl}` + "/api/frontdoor/create_tenant";
    return NetworkRequester.httpPost(url, {});
  }

  deleteTenant(id) {
    let url = `${this.baseUrl}` + "/api/frontdoor/delete_tenant";
    return NetworkRequester.httpPost(url, { id: id });
  }
  getMyTenant(para = {}) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_my_tenant";
    return NetworkRequester.httpPost(url, para);
  }
}

const TenantApi = new TenantApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default TenantApi;
