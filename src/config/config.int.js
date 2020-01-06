var CONFIG = {
  AUTH_CONFIG: {
    tenant: "72f988bf-86f1-41af-91ab-2d7cd011db47", // '1a2cd35e-5a38-49db-a88f-ba3c4c8b52fd', //COMMON OR YOUR TENANT ID
    clientId: "8e0c3629-9819-4cad-9471-8e6cf699eb17", // REPLACE WITH YOUR CLIENT ID
    redirectUri: "https://kensho2-int", // REPLACE WITH YOUR REDIRECT URL
    endpoints: "https://kensho2-int", // the endpoint for the web api.
    cacheLocation: "localStorage", // enable this for IE, as sessionStorage does not work for localhost.
    webApiAppIdUri:
      "https://microsoft.onmicrosoft.com/e7fb843c-62d5-47ff-ab63-ba0e66a8dc7a",
    anonymousEndpoints: [],
    popUp: false
  },
  CONFIG: {
    //AuthConfig: this.AUTH_CONFIG,
    BaseFrontDoorUrl: "https://frontdoor-kensho2-int.azurewebsites.net",
    schemaLoaderUrl: "https://kensho2-datasource-int.corp.microsoft.com:443/loadSchema",

    alertSenderUrl: "https://alert-kensho2-int-senderapi.azurewebsites.net",
    alertTraceUrl: "https://gw-tsdb.westus2.cloudapp.azure.com:10000"
  },
  AriaTenantToken:
    "3d11fa768f8049ff9cf871141cf41642-e17d07e0-611e-47e0-bef2-81b9bd196ede-7117"
};

export default CONFIG;
