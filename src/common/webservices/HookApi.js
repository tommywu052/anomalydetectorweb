import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";
import { promises } from "fs";
class HookApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }

  getHooksFromSub(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_subscription_hooks";
    return NetworkRequester.httpPost(url, data);
  }
  getSubscriptionsByHook(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_hook_subscriptions";
    if (data.metricName === "") {
      data = _.omit(data, ["metricName"]);
    }
    if (data.subscriptionName === "") {
      data = _.omit(data, ["subscriptionName"]);
    }
    return NetworkRequester.httpPost(url, data);
  }

  getSubscriptionCountByHook(para) {
    let url =
      `${this.baseUrl}` + "/api/FrontDoor/get_subscription_count_by_hook";
    return NetworkRequester.httpPost(url, para);
  }

  getMyHook(sortTypeId = 1) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_my_hooks";
    let data = {
      hookTypeId: 0,
      pageSize: -1,
      pageNum: -1,
      sortTypeId: sortTypeId
    };
    return NetworkRequester.httpPost(url, data);
  }

  createHook(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/create_hook";
    return NetworkRequester.httpPost(url, data);
  }

  updateHook(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/update_hook";
    return NetworkRequester.httpPost(url, data);
  }

  deleteHook(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/delete_hook";
    return NetworkRequester.httpPost(url, { body: id });
  }
  addHookUsers(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/add_hook_users";
    return NetworkRequester.httpPost(url, data);
  }

  removeHookUsers(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/remove_hook_users";
    return NetworkRequester.httpPost(url, data);
  }

  removeSubFromHook(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/update_subscription";
    return NetworkRequester.httpPost(url, data);
  }

  verifyIcmUrl(para) {
    let url = CONFIG.CONFIG.alertSenderUrl + "/api/sendicm";
    return NetworkRequester.httpPost(url, para);
  }
  verifyOspUrl(para) {
    let url = CONFIG.CONFIG.alertSenderUrl + "/api/osp/create";
    return NetworkRequester.httpPost(url, para);
  }

  autoResovle(para) {
    let url = CONFIG.CONFIG.alertSenderUrl + "/api/resolveicm";
    return NetworkRequester.httpPost(url, para);
  }
}

const HookApi = new HookApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default HookApi;
