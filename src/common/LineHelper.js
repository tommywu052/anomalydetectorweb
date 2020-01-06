import { TimeHelper } from "@/common/TimeHelper.js";
export class LineHelper {
    static getSampleRate(lines) {
        let maxsize = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].points.length > maxsize) {
            maxsize = lines[i].points.length;
          }
        }
        let sampleRate = (maxsize > 2017) ? ((maxsize / 2017).toFixed(0) * 1 + 1) : 1;
        return sampleRate
    }


    static initIdx(lines, granularity, customGran, sampleRate) {
        let mergedIdx = [];
        let min = null;
        let max = null;
        let line = null;
        for (let i = 0; i < lines.length; i++) {
          let tsIdx = lines[i].columns.indexOf('time');
          let valIdx = lines[i].columns.indexOf('__VAL__');

          if (max == null) {
            if (lines[i].points.length > 0) {
              min = new Date(lines[i].points[0][tsIdx]).getTime();
              max = new Date(lines[i].points[lines[i].points.length - 1][tsIdx]).getTime();
            }
          } else {
            if (lines[i].points.length > 0) {
              let maxx = new Date(lines[i].points[lines[i].points.length - 1][tsIdx]).getTime();
              let minn = new Date(lines[i].points[0][tsIdx]).getTime();
              max = max > maxx ? max : maxx;
              min = min < minn ? min : minn;
            }
          }
        }
        

        if (max != null && min != null) {
          mergedIdx.push(TimeHelper.convertDate2FullUniformStringForeceUTC(new Date(min), granularity));
          mergedIdx.push(TimeHelper.convertDate2FullUniformStringForeceUTC(new Date(max), granularity));
          let step = 0;
          if (granularity === 4) {
            step = 86400000;
          } else if (granularity === 5) {
            step = 3600000;
          } else if (granularity === 3) {
            step = 86400000 * 7;
          } else if (granularity === 8 && customGran) {
            step = customGran * 1000;
          }
  
          step *= sampleRate; 
          // 
          if (step > 0) {
            for (let i = 0; i < mergedIdx.length - 1; i++) {
              let t1 = new Date(mergedIdx[i]).getTime();
              let t2 = new Date(mergedIdx[i + 1]).getTime();
              while (t1 + step < t2) {
                t1 += step;
                let tmp = TimeHelper.convertDate2FullUniformStringForeceUTC(new Date(t1), granularity);
                if (mergedIdx.indexOf(tmp) < 0) {
                  mergedIdx.push(tmp);
                }
              }
            }
          }
          else {
            for (let i = 0; i < lines.length; i++) {
              let tsIdx = lines[i].columns.indexOf('time');
              for (let j = 0; j < lines[i].points.length; j++) {
                let ts = TimeHelper.convertDate2FullUniformStringForeceUTC((new Date(lines[i].points[j][tsIdx])), granularity);
                if (mergedIdx.indexOf(ts) < 0) {
                  mergedIdx.push(ts);
                }
              }
            }            
          }
          mergedIdx.sort();
        }
        
        let pos = [];
        for (let i = 0; i < lines.length; i++) {
          pos.push(0);
        }
        for (let idx = 0; idx < mergedIdx.length; idx++) {
          for (let i = 0; i < lines.length; i++) {
            let tsIdx = lines[i].columns.indexOf('time');
            if (lines[i].points[pos[i]] && lines[i].points[pos[i]][tsIdx] == mergedIdx[idx]) {
              pos[i] ++;
            }
            else {
              lines[i].points.splice(idx, 0, [mergedIdx[idx], null]);
              pos[i] = idx + 1;
            }
          }
        }
        return mergedIdx
    }
}