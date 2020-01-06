import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";
import {
  datafeedProgressDetailMock,
  datafeedProgressMock
} from "@/mocks/datafeedProgressDetailMock";
import { promises } from "fs";
class DatafeedApiWrapper {
  logger = new Logger();
  baseUrl = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of metrics api: ${baseUrl}`);
  }

  loadSchema(url, data) {
    return NetworkRequester.httpPost(CONFIG.CONFIG.schemaLoaderUrl, data);
  }

  loadIOTSchema(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/iot_datafeed_get_schema";
    // let url = "https://meta-frontdoor.azurewebsites.net/api/frontdoor/iot_datafeed_get_schema";
    return NetworkRequester.httpPost(url, data);
    // return NetworkRequester.httpPost(CONFIG.CONFIG.IOTschemaLoaderUrl, data);
  }
  getMyDatafeeds(data) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_my_datafeed";

    return NetworkRequester.httpPost(url, data);
  }

  getMyDatafeedsTotalNum(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_my_datafeeds_total_count";
    //return NetworkRequester.httpPost(url, {});
    return NetworkRequester.httpPost(url, para);
  }

  getListGranType() {
    let url = `${this.baseUrl}` + "/api/FrontDoor/list_gran_type";
    return NetworkRequester.httpGet(url).then(res => {
      res.data = _.omit(res.data, ["6"]);
      return res;
    });
  }

  getDatafeedDelayAlerts(data) {
    //     {
    //       "datafeedUid":"ff44a419-bf09-44b2-890a-7d5807b5a0c9",
    //       "alertStatus":2, // 2=active, 4=resolved, -1=all
    //       "pageNum": 0,
    //       "pageSize": 20
    // }
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_datafeed_delay_alerts";
    return NetworkRequester.httpPost(url, data);
  }
  updateDatafeed(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/update_datafeed";
    return NetworkRequester.httpPost(url, para);
  }

  getListOnboardType() {
    let url = `${this.baseUrl}` + "/api/FrontDoor/list_onboard_type";
    return NetworkRequester.httpGet(url);
  }

  createDatafeed(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/create_datafeed";
    return NetworkRequester.httpPost(url, para);
  }

  createIOTDatafeed(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/iot_datafeed_create";
    return NetworkRequester.httpPost(url, para);
  }

  getDatafeedProcessDetail(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_datafeed_details";
    return NetworkRequester.httpPost(url, para);
  }

  subscribeDatafeed(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/subscribe_datafeed";
    let _para = {
      ...para,
      subscriptionTypeId: 2,
      subscriptionName: "default",
      subscriptionDescription: ""
    };
    return NetworkRequester.httpPost(url, _para);
  }

  updateSubscription(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/update_subscription";
    return NetworkRequester.httpPost(url, para);
  }

  pauseDatafeed(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/pause_datafeed";
    return NetworkRequester.httpPost(url, { body: id });
  }

  pauseIOTDatafeed(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/iot_datafeed_pause";
    return NetworkRequester.httpPost(url, { body: id });
  }

  reactiveDatafeed(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/reactive_datafeed";
    return NetworkRequester.httpPost(url, { body: id });
  }

  reactiveIOTDatafeed(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/iot_datafeed_resume";
    return NetworkRequester.httpPost(url, { body: id });
  }

  deleteDatafeed(id) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/delete_datafeed";
    return NetworkRequester.httpPost(url, { body: id });
  }

  ping() {
    let url = `${this.baseUrl}` + "/api/frontdoor/ping";
    return NetworkRequester.httpGet(url);
  }

  addDatafeedUsers(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/add_datafeed_users";
    return NetworkRequester.httpPost(url, para);
  }

  removeDatafeedUsers(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/remove_datafeed_users";
    return NetworkRequester.httpPost(url, para);
  }

  getUser() {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_user";
    return NetworkRequester.httpGet(url);
  }

  isSuperUser() {
    let url = `${this.baseUrl}` + "/api/frontdoor/is_superuser";
    return NetworkRequester.httpGet(url);
  }

  getdatafeedSubscriptions(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_datafeed_subscriptions";
    return NetworkRequester.httpPost(url, para);
  }

  getDatafeedProgress(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_datafeed_progress";
    return NetworkRequester.httpPost(url, para);
    //return Promise.resolve(datafeedProgressMock);
  }

  resetDatafeedProgress(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/reset_datafeed_progress";
    return NetworkRequester.httpPost(url, para);
  }

  getDatafeedLastSuccess(para) {
    let url = `${this.baseUrl}` + "/api/frontdoor/get_datafeed_latest_success";
    return NetworkRequester.httpPost(url, para);
  }
}

const DatafeedApi = new DatafeedApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default DatafeedApi;
