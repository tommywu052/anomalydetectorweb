import { Logger } from "@/util/log";
import CONFIG from "@/config/config.js";
import NetworkRequester from "./NetworkRequester";

class RichSignalApiWrapper {
  logger = new Logger();
  baseUrl = null;

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.logger.info(`Base url of rich signal api: ${baseUrl}`);
  }

  getRichSignalByMetricsId(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/get_rich_signal_by_metrics_id";
    return NetworkRequester.httpPost(url, para);
  }

  createOrUpdateRichSignal(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/create_rich_signal";
    return NetworkRequester.httpPost(url, para);
  }

  updateRichSignal(para) {
    let url = `${this.baseUrl}` + "/api/FrontDoor/update_rich_signal";
    return NetworkRequester.httpPost(url, para);
  }

  getCountryCodes() {
    let countryCodes = {'AD':'Andorra', 'AE':'United Arab Emirates', 'AL':'Albania', 'AM':'Armenia', 'AO':'Angola', 'AR':'Argentina', 'AT':'Austria', 'AU':'Australia', 'AZ':'Azerbaijan', 'BA':'Bosnia and Herzegovina', 'BE':'Belgium', 'BG':'Bulgaria', 'BH':'Bahrain', 'BN':'Brunei', 'BO':'Bolivia', 'BR':'Brazil', 'BY':'Belarus', 'CA':'Canada', 'CD':'Congo (Democratic Republic of)', 'CH':'Switzerland', 'CL':'Chile', 'CN':'China', 'CO':'Colombia', 'CR':'Costa Rica', 'CY':'Cyprus', 'CZ':'Czechia', 'DE':'Germany', 'DK':'Denmark', 'DO':'Dominican Republic', 'DZ':'Algeria', 'EC':'Ecuador', 'EE':'Estonia', 'EG':'Egypt', 'ES':'Spain', 'EU':'European Union', 'FI':'Finland', 'FR':'France', 'GB':'United Kingdom', 'GE':'Georgia', 'GQ':'Equatorial Guinea', 'GR':'Greece', 'GT':'Guatemala', 'HK':'Hong Kong S.A.R.', 'HN':'Honduras', 'HR':'Croatia', 'HU':'Hungary', 'IE':'Ireland', 'IL':'Israel', 'IN':'India', 'IQ':'Iraq', 'IR':'Iran', 'IS':'Iceland', 'IT':'Italy', 'JM':'Jamaica', 'JO':'Jordan', 'JP':'Japan', 'KE':'Kenya', 'KR':'Korea', 'KW':'Kuwait', 'KZ':'Kazakhstan', 'LB':'Lebanon', 'LI':'Liechtenstein', 'LT':'Lithuania', 'LU':'Luxembourg', 'LV':'Latvia', 'MA':'Morocco', 'MC':'Monaco', 'MD':'Moldova', 'ME':'Montenegro', 'MK':'Macedonia FYRO', 'MO':'Macao S.A.R.', 'MT':'Malta', 'MX':'Mexico', 'MY':'Malaysia', 'NG':'Nigeria', 'NI':'Nicaragua', 'NL':'Netherlands', 'NO':'Norway', 'NZ':'New Zealand', 'OM':'Oman', 'PA':'Panama', 'PE':'Peru', 'PH':'Philippines', 'PK':'Pakistan', 'PL':'Poland', 'PR':'Puerto Rico', 'PT':'Portugal', 'PY':'Paraguay', 'QA':'Qatar', 'RO':'Romania', 'RS':'Serbia', 'RU':'Russia', 'SA':'Saudi Arabia', 'SE':'Sweden', 'SG':'Singapore', 'SI':'Slovenia', 'SK':'Slovakia', 'SM':'San Marino', 'SV':'El Salvador', 'SY':'Syria', 'TH':'Thailand', 'TN':'Tunisia', 'TR':'Turkey', 'TT':'Trinidad and Tobago', 'UA':'Ukraine', 'US':'United States', 'UY':'Uruguay', 'VA':'Holy See (Vatican City)', 'VE':'Venezuela', 'VN':'Vietnam', 'YE':'Yemen', 'ZA':'South Africa'};
    return countryCodes;
  }
}

const RichSignalApi = new RichSignalApiWrapper(CONFIG.CONFIG.BaseFrontDoorUrl);

export default RichSignalApi;
