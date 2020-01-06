<template>
    <div class="layout">
        <Layout>
            <Header>
                <Menu mode="horizontal" theme="light" active-name="1" @on-select="changeMode">
                    <div class="layout-nav">
                        <MenuItem name="1">
                            Anomaly detector Last API
                        </MenuItem>
                        <MenuItem name="2">
                            Anomaly detector Entire API
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '0 50px'}">
              <Row>
                <Col span=16>
                  <div v-if="lines.length>0">
                    <Col span="24" style="font-size: 16px; text-align: right; margin: 20px 0px">
                        <Col span="20" style="font-size: 16px; text-align: left">
                          <Button @click="handleUpload('/sample1.csv', true)">Sample 1</Button>
                          &nbsp;&nbsp;
                          <Button @click="handleUpload('/sample2.csv', true)">Sample 2</Button>
                          &nbsp;
                          <Button @click="handleUpload('/sample3.csv', true)">Sample 3 with seasonality</Button>
                          &nbsp;
                        </Col>
                        <Col span="4">
                          <Upload :before-upload="handleUpload"
                                  action="/"
                                  accept=".csv">
                            <a>Choose local file</a>
                            <!-- <Button style="margin-left:15px"
                                        size="small">Select a file</Button> -->
                          </Upload>
                        </Col>
                    </Col>
                    <Col span="24"
                          v-if="mode == 'Last'"
                          style="padding: 5px; font-size: 14px; text-align: center; background: #EFEFEF; color: #AAA">
                      "Last" mode will play a streaming detection from the 13th point. Every point will be detected based on a model trained by earlier data. It simulates the real streaming monitoring.
                      <br/>
                      <span style="color: #39393">Please click any point on the chart, detection will start at the point. </span>
                      <BR/> Status:
                      <span v-if="running"
                            style="color: #393939">Autoplaying</span>
                      <span style="color: #393939"
                            v-if="!running">Stopped</span>
                      &nbsp;
                      <Button href="#"
                        @click="stopAutoRun"
                        v-if="running">Stop</Button>
                      <Button href="#"
                        @click="autoRun"
                        v-if="!running && runningIdx > 12">Continue</Button>
                      <Button href="#"
                        @click="autoRun"
                        v-if="!running && runningIdx == 12">Start</Button>
                    </Col>
                    <Col span="24"
                          v-if="mode == 'Entire'"
                          style="padding: 5px; font-size: 14px; text-align: center; background: #EFEFEF; color: #AAA">
                      "Entire" will build single model for the whole timeseries and detect anomalies with the model and all the data points.
                      <br/>
                      <Button href="#"
                        @click="getEntire"
                        v-if="!running && runningIdx == 12">Start</Button>
                    </Col>
                    <Col span="24"
                          style="padding: 5px;"
                          v-for="(v,i) in lines"
                          :key="i">
                      <smart-line :ShowLegend="true"
                                  :Toolbox="true"
                                  :Lines="[v]"
                                  :CanvasId="'InsightChart_'+ false + '_' + i"
                                  CanvasHeight="300"
                                  ChartHeight="300"
                                  ChartWidth="100%"
                                  :TunningParameters="tunning"
                                  :Zooming="true"
                                  :MarkStart="markStart"
                                  :MarkEnd="markEnd"
                                  :HighlightTS="mode=='Entire' ? null: v.points[runningIdx][0]"
                                  @ptclick="onPtClick"
                                  :ShowAnomaly="true"></smart-line>
                    </Col>
                    <Col span="24"
                          v-if="lines"
                          style="padding: 5px; font-size: 14px; text-align: center;">
                          <Col span="6">
                            Sensitivity (Simulated in client)
                          </Col>
                          <Col span="16">
                            <Slider v-model="tunning.sensitivity"
                                    show-tip="always"
                                    :max="99"
                                    :step="1"
                                    ></Slider>
                            <BR/>
                            <span style="color: #939393">
                              "Sensitivity" is from 0 to 99, it defines how sensitive the backend API performs filtering on the result of anomaly detection algorithms. 
                              Adjust the sensitivity to see how it affects the anomalies filtering. 
                              <BR/>
                              
                            </span>
                          </Col>
                    </Col>
                    <Col span="24" v-if="lines && mode == 'Last'"
                          style="padding: 5px; font-size: 14px; text-align: center;">
                          <Col span="6">
                            Max detecting window
                          </Col>
                          <Col span="16">
                            <Slider v-model="window"
                                    :max="maxWindow"
                                    :min="28"
                                    show-tip="always"
                                    :step="1"></Slider>
                            <BR/>
                            <span style="color: #939393">
                              "Max detecting window" defines how many history points are used to detect current anomalies. The range of the window varies according to different granularity. 
                            </span>
                          </Col>
                    </Col>
                    <Col span="24" v-if="lines"
                          style="padding: 5px; font-size: 14px; text-align: center;">
                          <Col span="6">
                            Max anomaly ratio
                          </Col>
                          <Col span="16">
                            <Slider v-model="ratio"
                                    :max="1"
                                    :min="0.01"
                                    show-tip="always"
                                    :step="0.01"></Slider>
                            <BR/>
                            <span style="color: #939393">
                              "Max ratio" defines the max percentage of anomalies in one detection. 
                            </span>
                          </Col>
                    </Col>
                  </div>
                  <div v-else
                      class="content-no-data-hint">
                    <Upload :before-upload="handleUpload"
                            action="/"
                            accept=".csv">
                      <a>Choose local file</a>
                      <!-- <Button style="margin-left:15px"
                                  size="small">Select a file</Button> -->
                    </Upload>
                    <Button @click="handleUpload('/sample1.csv', true)">Sample 1</Button>
                    &nbsp;&nbsp;
                    <Button @click="handleUpload('/sample2.csv', true)">Sample 2</Button>
                    &nbsp;&nbsp;
                    <Button @click="handleUpload('/sample3.csv', true)">Sample 3 with seasonality</Button>
                          &nbsp;
                    <div style="font-size: 16px; padding: 0px 10px;">
                      <br/><br/> Choose a CSV file with the format as below, to see what happens after anomaly detection: <br/><br/>
                      <Table :columns="sampleCol"
                            :data="sampleData"
                            :disabled-hover="true"></Table>
                    </div>
                  </div>
                </Col>
                <Col span=8 style="padding: 10px;">
                  <Card>
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        API key&nbsp; <a href="https://azure.microsoft.com/en-us/services/cognitive-services/anomaly-detector/"> Get a key</a>
                    </p>
                    <p>
                      Endpoint: <BR/>
                      <Input v-model="curEndpoint" :rows="8" placeholder="https://westus2.api.cognitive.microsoft.com" style="width:250px"/>
                      <Input v-model="curEndpoint2" :rows="8" placeholder="Input API ..." style="width:250px"/>

                    </p>
                    <p>
                    Key: <BR/>
                    <Input v-model="key" :rows="8" placeholder="Input API key..." />
                    </p>
                  </Card>
                  <Card style="margin-top: 20px">
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        Current request
                    </p>
                    <Input v-model="curReq" type="textarea" :rows="8" placeholder="Current request..." />
                  </Card>
                  <Card style="margin-top: 20px">
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        Current response
                    </p>
                    <Input v-model="curRes" type="textarea" :rows="8" placeholder="Current response..." />
                  </Card>
                </Col>
                <Col span="24">
                  <Divider />
                </Col>
                <Col span="24">
                  <H2>About Anomaly Detector demo</H2>
                  <p style="font-size: 14px">
This demo shows you how Anomaly Detector detects anomalies from time series data automatically in streaming or batch ways. Anomaly Detector learns from the time series data in the API requests about the normal pattern and generates output on which data points are anomalies, expected values, upper/lower bounds. You can also see how the sensitivity parameter can impact detection results and upper/lower bounds of normal value range dynamically, the higher the value, the narrower the band and the more anomalies would be marked. 
<BR/><BR/>
If you would like to see the streaming data anomaly detection, choose the tab “Anomaly Detector Last API”. How it works is that by sending new data points as you generate them, you can monitor your data in real time. A model will be updated with the data points you send, and the API will determine if the latest point in the time series is an anomaly. You can either use the preload samples or upload your samples by csv. 
<BR/><BR/>
If you would like to see the batch data anomaly detection, choose the tab “Anomaly Detector Entire API”. The API will generate a model using the entire series by sending your time series data at once, and analyze each data point with the same model. You can either use the samples preloaded or upload your samples by csv. 
<BR/><BR/>
If you would like to see code alongside with charts, use Anomaly Detector demo on Azure notebook (hosted Jupyter notebook), find it <a href="https://notebooks.azure.com/AzureAnomalyDetection/projects/anomalydetector">https://notebooks.azure.com/AzureAnomalyDetection/projects/anomalydetector</a>
<BR/><BR/>
                  </p>
                </Col>
              </Row>
              <Spin fix
                    v-if="toggleSpin"></Spin>
            </Content>
            <Footer class="layout-footer-center">2019 &copy; Microsoft</Footer>
        </Layout>
    </div>
</template>

<script>
// @ is an alias to /src
import MetricApi from "@/common/webservices/MetricApi.js";
import eventHub from "@/common/EventHub.js";
import moment,{ min } from "moment";
import CsvParser from "papaparse";
import SmartLine from "@/components/charts/SmartLine";
import draggable from "vuedraggable";

let lastperiod = null;
const MAX_SERIES_POINT = 8640;
const ColsWithAd = ["time", "__VAL__", "__FIELD__.ExpectedValue", "__FIELD__.IsAnomaly", "__FIELD__.Period", "__FIELD__.UpperMargin", "__FIELD__.LowerMargin"];
function formUpRequestData(org, fields) {
  let cols = _.unzip(org);
  let res = [];
  const timestampCol = _.map(cols[0], function(v) {
    return moment.utc(v).format();
  });
  for (let i = 1; i < cols.length; i++) {
    let c = _.zipObject(timestampCol, _.map(cols[i], v => Number(v)));
    let paired = _.toPairs(c);
    if (paired.length > MAX_SERIES_POINT) {
      paired = paired.slice(0, MAX_SERIES_POINT);
    }
    res.push({
      points: paired,
      id: {
        dimensions: {
          title: fields ? fields[i] : i
        }
      },
      columns: ["time", "__VAL__"]
    });
  }
  return res;
}

function mergeEntireAnomaly(org, adRes) {
  let res = _.cloneDeep(org);
  res.forEach((v, i) => {
    v.columns = ColsWithAd;
    for (let j = 0; j < v.points.length; j++) {
      v.points[j] = [v.points[j][0], v.points[j][1], adRes["expectedValues"][j], adRes["isAnomaly"][j], adRes["period"], adRes['upperMargins'][j], adRes['lowerMargins'][j]]
    }
  });

  return res;
}

function mergeLastAnomaly(org, adRes, idx) {
  let res = _.cloneDeep(org);

  res.forEach((v, i) => {
    v.columns = ColsWithAd;
    v.points = _.map(v.points, vv => {
      let p = [vv[0], vv[1], vv[2] ? vv[2] : null, vv[3] ? vv[3] : null, vv[4] ? vv[4] : null , vv[5] ? vv[5] : null , vv[6] ? vv[6] : null];
      return p;
    });
    v.points[idx][2] = adRes[i]["expectedValue"];
    v.points[idx][3] = adRes[i]["isAnomaly"];
    v.points[idx][4] = adRes[i]["period"];
    v.points[idx][5] = adRes[i]["upperMargin"];
    v.points[idx][6] = adRes[i]["lowerMargin"];
  });
  if (res.length > 0 && res[0].points[idx][4] > 0) {
    lastperiod = res[0].points[idx][4];
  }
  return res;
}


export default {
  components: {
    SmartLine,
    draggable
  },
  created: function() {
    this.$Message.config({
      top: 150,
      duration: 3
    });
  },
  data() {
    return {
      seriesSpan: 12,
      file: null,
      toggleSpin: false,
      lines: [],
      rawData: [],
      mode: "Last",
      currentTimeStamp: "",
      withHeader: true,
      running: false,
      gran: "",
      markStart: null, 
      markEnd: null,
      response: '',
      cusinterval: 1,
      startIdx: 12,
      runningIdx: 12,
      maxWindow: 28,
      ratio: 0.25,
      key: null,
      curReq: '', 
      curEndpoint: 'https://westus2.api.cognitive.microsoft.com',
      curEndpoint2: "/anomalydetector/v1.0/timeseries/last/detect",
      curRes: '',
      window: 28,
      windowRange: 28 * 86400000,
      tunning: {
        sensitivity: 70,
        upperBound: 0,
        lowerBound: 0,
        anomalyDetectorDirection: 3,
        anomalyDetectorType: "SmartDetector",
        autoSnooze: 0,
        minAlertNumber: 1,
        minAlertRatio: 100,
        severity: 4,
        spikeOnly: false,
        changePercentage: 5.0,
        changePercentageOver: 1
      },
      sampleCol: [
        {
          title: "Timestamp",
          key: "ts"
        },
        {
          title: "Value1",
          key: "val1"
        }
      ],
      sampleData: [
        {
          ts: "2019-01-01T00:00:00Z",
          val1: 18,
          val2: 10
        },
        {
          ts: "2019-01-02T00:00:00Z",
          val1: 18,
          val2: 12
        }
      ]
    };
  },
  computed: {},

  methods: {
    changeMode: function(name) {
      switch (name) {
        case "3":
          window.location.href = "https://azure.microsoft.com/en-us/services/cognitive-services/anomaly-detector/";
          break;
        case "4":
          window.location.href = "https://privacy.microsoft.com/en-US/privacystatement";
        case "2":
          this.running = false;
          this.runningIdx = 12;
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
          if (this.rawData) {
            this.lines = this.rawData;
          }
          this.mode='Entire'
          this.curEndpoint2 = "/anomalydetector/v1.0/timeseries/entire/detect";
          // this.curEndpoint = 'https://westus2.api.cognitive.microsoft.com/anomalydetector/v1.0/timeseries/entire/detect';
          break;
        case "1":
          if (this.rawData) {
            this.lines = this.rawData;
          }
          this.mode = 'Last';
          this.curEndpoint2 = "/anomalydetector/v1.0/timeseries/last/detect";
          // this.curEndpoint = 'https://westus2.api.cognitive.microsoft.com/anomalydetector/v1.0/timeseries/last/detect';
          // this.running = true;
          // this.autoRun();
          // this.getLastAnomaly(4);
          break;
      }
    },
    onVisibleChange: function(visible) {
      if (!visible) {
        this.stopAutoRun();
      }
    },
    stopAutoRun: function() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
        this.running = false;
        // this.runningIdx = 12;
      }
    },
    autoRun: function() {
      if (!this.key) {
        alert("API key is required");
        return;
      }
      if (this.rawData[0].points.length <= 12) {
        this.$Message.warning("Too few data points to perform detection. ");
        return;
      }

      if (this.runningIdx < 12) {
        this.$Message.warning("We need at least 12 data points before we start anomaly detection.  ");
        return;
      }
      this.startIdx = this.runningIdx;

      let self = this;
      this.running = true;
      this.interval = setInterval(function() {
        if (self.running) {
          self.getLastAnomaly(self.runningIdx);
          if (self.runningIdx == self.rawData[0].points.length - 1) {
            self.running = false;
            this.runningIdx = 12;
          } else {
            self.runningIdx++;
            if (self.runningIdx - self.startIdx >= 100) {
              self.running = false;
              self.$Message.info("Stopped at every 100 iterations, click 'Continue' to go on.  ");
              clearInterval(self.interval);
            }
          }
        } else {
          clearInterval(self.interval);
          self.interval = null;
          // self.runningIdx = 12;
        }
      }, 800);
    },
    onPtClick: function(para) {
      if (this.mode === "Last") {
        if (para.index < 12) {
          this.$Message.info(`Need at least 12 points to run Anomaly Detection`);
          return;
        } else {
          // let pointLen = this.rawData[0].points.length;
          // this.getLastAnomaly(pointLen - para.index - 1);
          this.runningIdx = para.index;
          this.startIdx = para.index;
          if (!this.running) {
            this.autoRun();
          }
        }
      }
      else {
          this.running = false;
          this.runningIdx = 12;
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
          this.getEntire();
      }
    },

    getEntire: function() {
      if (!this.key) {
        alert("API key is required");
        return;
      }

      this.markStart = null;
      this.markEnd = null;
      this.toggleSpin = true;
      let rawData = _.cloneDeep(this.rawData);
      let adResArray = [];
      let promiseAll = [];
      let lines = _.map(rawData, v => {
        let tmp = [];
        
        let window = this.windowRange;
        for (let i = 0; i < v.points.length; i++) {
          tmp.push(v.points[i]);
        }
        v.points = tmp;
        return v.points;
      });
      lines.forEach(line => {
        const para = {
          series: _.sortBy(
            _.map(line, v => {
              return { timestamp: v[0], value: v[1] };
            }),
            [
              function(v) {
                return new Date(v.Timestamp).getTime();
              }
            ]
          ),
          maxAnomalyRatio: this.ratio,
          sensitivity: this.tunning.sensitivity,
          granularity: this.gran, 
          customInterval: this.cusinterval
        };
        promiseAll.push(
          MetricApi.getCsvAnomalyEntire(para, this.curEndpoint + this.curEndpoint2, this.key)
            .then(res => {
              this.curReq = JSON.stringify(para);
              this.curRes = JSON.stringify(res.data);
              this.lines = mergeEntireAnomaly(this.lines, res.data);
            })
            .finally(() => {
              // msg();
              this.toggleSpin = false;
            })
        );
      });
    },
    getLastAnomaly: function(value) {
      let rawData = _.cloneDeep(this.rawData);
      let lines = _.map(rawData, v => {
        v.points = _.dropRight(v.points, v.points.length - value - 1);
        let tmp = [];
        
        let window = this.windowRange;
        for (let i = 0; i < v.points.length; i++) {
          if (new Date(v.points[i][0]).getTime() >= new Date(v.points[value][0]).getTime() - window) {
            if (tmp.length == 0) {
              this.markStart = v.points[i][0];
            }
            tmp.push(v.points[i]);
          }
        }
        this.markEnd = v.points[value][0];
        v.points = tmp;
        return v.points;
      });
      let adResArray = [];
      let promiseAll = [];
      lines.forEach(line => {
        const para = {
          series: _.sortBy(
            _.map(line, v => {
              return { timestamp: v[0], value: v[1] };
            }),
            [
              function(v) {
                return new Date(v.Timestamp).getTime();
              }
            ]
          ),
          maxAnomalyRatio: this.ratio,
          sensitivity: this.tunning.sensitivity,
          granularity: this.gran, 
          customInterval: this.cusinterval, 

        };
        if (lastperiod) {
          para.period = lastperiod;
        }
        promiseAll.push(
          
          MetricApi.getCsvAnomalyLast(para, this.curEndpoint + this.curEndpoint2, this.key)
            .then(res => {
              this.curReq = JSON.stringify(para);
              this.curRes = JSON.stringify(res.data);
              adResArray.push(res.data);
            })
            .finally(() => {
              // msg();
            })
        );
      });
      Promise.all(promiseAll).then(v => {
        this.lines = mergeLastAnomaly(this.lines, adResArray, value);
      });
    },

    reset: function() {
      this.file = null;
      this.lines = [];
      this.rawData = [];
      
    },

    handleUpload: function(file, url = false) {
      this.reset();
      this.file = file;
      this.parseCsv(file, url)
        .then(res => {
          this.rawData = formUpRequestData(res.data, res.meta.fields);
          this.rawData = [this.rawData[0]];
          this.lines = this.rawData;
          this.startIdx = 12;
          this.runningIdx = this.startIdx;
          this.running = false;
          let mininterval = Number.MAX_VALUE;
          let interval;
          for (let i = 0; i < this.rawData[0].points.length - 1; i++) {
            interval = (new Date(this.rawData[0].points[i + 1][0])).getTime() - (new Date(this.rawData[0].points[i][0])).getTime();
            if (interval < mininterval) {
              mininterval = interval;
            }
          }

          if (interval % 604800000 == 0) {
            this.gran = 'weekly';
            this.maxWindow = 48;
            this.window = 12;
            this.windowRange = this.window * this.cusinterval * 604800000;
          }
          else if (interval % 86400000 == 0) {
            this.gran = 'daily';
            this.maxWindow = 56;
            this.window = 28;
            this.windowRange = this.window * this.cusinterval * 86400000;
          }
          else if (interval % 3600000 == 0) {
            this.gran = 'hourly';
            this.maxWindow = 672;
            this.window = 672;
            this.windowRange = this.window * this.cusinterval * 3600000;
          }
          else if (interval % 60000 == 0) {
            this.gran = 'minutely';
            this.cusinterval = interval / 60000;
            this.maxWindow = 8064;
            this.window = 60;
            this.windowRange = this.window * this.cusinterval * 60000;
          }
          else {
            this.gran = 'secondly';
            this.cusinterval = interval / 1000;
            this.maxWindow = 7200;
            this.window = 3600;
            this.windowRange = this.window * this.cusinterval * 1000;
          }
          // this.getEntire();
        })
        .catch(err => {
          this.$Notice.error({
            title: "error",
            desc: err
          });
        });
      return false;
    },

    parseCsv: function(file, url = false) {
      lastperiod = null;
      const promise = new Promise((resolve, reject) => {
        
        if (url) {
          CsvParser.parse(file, {
            download: true,
            skipEmptyLines: true,
            header: this.withHeader,
            complete: (results, file) => {
              // console.log("Parsing complete:", results, file);
              //  if(results.data.length>8640){
              //   this.$Message.info(`The imported data has been sliced to max length 8640.`);
              //   results.data=results.data.slice(0,8640);
              //  }
          

              if (this.withHeader === true) {
                results.data = _.map(results.data, v => _.values(v));
              }

              results.data = _.map(results.data, v => {
                v[0] = v[0].replace(/['"]/g, "").trim();
                return v;
              });
              results.data = _.filter(results.data, function(v) {
                // let date = new Date(v[0]);
                return !isNaN(Date.parse(v[0]));
              });
              resolve(results);
            },
            error: function(err, file, inputElem, reason) {
              reject("Can not parse this file.");
            }
          });
        }
        else {
          CsvParser.parse(file, {
            skipEmptyLines: true,
            header: this.withHeader,
            complete: (results, file) => {
              // console.log("Parsing complete:", results, file);
              //  if(results.data.length>8640){
              //   this.$Message.info(`The imported data has been sliced to max length 8640.`);
              //   results.data=results.data.slice(0,8640);
              //  }
              if (this.withHeader === true) {
                results.data = _.map(results.data, v => _.values(v));
              }
              let idx = 0;

              if (results.data.length > 0) {
                
                while (!Date.parse(results.data[0][idx]) && idx < results.data[0].length) {
                  idx ++;
                }
              }
              results.data = _.map(results.data, v => {
                v[idx] = v[idx].replace(/['"]/g, "").trim();
                let tmp = v[idx];
                v[idx] = v[0];
                v[0] = tmp;
                return v;
              });
              results.data = _.filter(results.data, function(v) {
                // let date = new Date(v[0]);
                return !isNaN(Date.parse(v[0]));
              });
              resolve(results);
            },
            error: function(err, file, inputElem, reason) {
              reject("Can not parse this file.");
            }
          });
        }

      });
      return promise;
    }
  }
};
</script>

<style scoped>
.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    overflow: hidden;
    width: 100%;
}
.layout-logo{
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}
.layout-nav{
    width: 100%;
    margin: 0 auto;
}
.layout-footer-center{
    text-align: center;
}
</style>