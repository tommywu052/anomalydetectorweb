var CONFIG = {
  AUTH_CONFIG: {
    tenant: "72f988bf-86f1-41af-91ab-2d7cd011db47", // '1a2cd35e-5a38-49db-a88f-ba3c4c8b52fd', //COMMON OR YOUR TENANT ID
    clientId: "8e0c3629-9819-4cad-9471-8e6cf699eb17", // REPLACE WITH YOUR CLIENT ID
    redirectUri: "https://kensho2-dev/", // REPLACE WITH YOUR REDIRECT URL
    endpoints: "https://kensho2-dev/", // the endpoint for the web api.
    cacheLocation: "localStorage", // enable this for IE, as sessionStorage does not work for localhost.
    webApiAppIdUri: "https://microsoft.onmicrosoft.com/e7fb843c-62d5-47ff-ab63-ba0e66a8dc7a",
    anonymousEndpoints: [],
    popUp: false
  },
  CONFIG: {
    //AuthConfig: this.AUTH_CONFIG,
    BaseFrontDoorUrl: "https://meta-frontdoor.azurewebsites.net",
    schemaLoaderUrl: "https://kensho2-datasource-dev.corp.microsoft.com/loadSchema",
    alertSenderUrl: "https://alert-kensho2-dev-senderapi.azurewebsites.net",
    alertTraceUrl: "https://gw-tsdb.westus2.cloudapp.azure.com:10000"
  },
  AriaTenantToken: "92e1b54d3fc0499e8b38a30d57dbb6f8-17938662-5c6b-4857-9591-a2327b327261-6945"
};

export default CONFIG;
