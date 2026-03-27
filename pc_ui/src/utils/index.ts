/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:05:36
 * @Last Modified by: 兰舰
 * @Last Modified time: 2024-11-28 14:09:055
* @Copyright aPaaS-front-team. All rights reserved.
*/
export function getTimeStampByDate(t) {
    const d = new Date(t);
    return d.getTime();
  }
  
  export function getDateString(
    t,
    format = "yyyy/MM/dd hh:mm:ss"
  ) {
    const d = new Date(getTimeStampByDate(t));
  
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
  
    const formatedString = format
      .replace("yyyy", String(year))
      .replace("MM", String(month))
      .replace("dd", String(date))
      .replace("hh", String(hours))
      .replace("mm", String(minutes))
      .replace("ss", String(seconds));
  
    return formatedString;
  }
  
  // 时间戳转换为 时间格式
  export function formatDate(value) {
    if (!value) {
      return ''
    }
    if (value.toString().length === 10) {
      value = value * 1000
    }
    if (value.toString().length === 13) {
      return returnTime(value)
    }
    if (value.toString().includes('CST')) {
      value = value.split("CST")[0]
    }
    const date = new Date(value)
  
    let reStr = returnTime(date.getTime())
    if (!reStr) {
      const dateNumFun = (num) => num < 10 ? `0${num}` : num
      const [Y, M, D, h, m, s] = [
        date.getFullYear(),
        dateNumFun(date.getMonth() + 1),
        dateNumFun(date.getDate()),
        dateNumFun(date.getHours()),
        dateNumFun(date.getMinutes()),
        dateNumFun(date.getSeconds())
      ]
      if (date.getFullYear() !== new Date().getFullYear()) {
        return `${Y}-${M}-${D} ${h}:${m}`
      } else {
        return `${M}-${D} ${h}:${m}`
      }
    }else {
      return reStr
    }
  }
  
  function returnTime(value) {
      let nowTimes = new Date().getTime()
      if (nowTimes - value < 60 * 1000) {
        if (Math.floor((nowTimes - value) / 1000) < 5 ) {
          return '刚刚'
        } else {
          return Math.floor((nowTimes - value) / 1000) + '秒前'
        }
      }
      if (nowTimes - value < 60 * 60 * 1000) {
        return Math.floor((nowTimes - value) / (60 * 1000)) + '分钟前'
      }
      if (nowTimes - value < 24 * 60 * 60 * 1000) {
        return Math.floor((nowTimes - value) / (60 * 60 * 1000)) + '小时前'
      }
      return getDateString(value, "yyyy-MM-dd")
  }
  export function formatDateToFull(value) {
    if (!value) {
      return ''
    }
    if (value instanceof Date) {
      value = value.getTime()
    } else {
      let tempStr = value + ''
      if (tempStr.length !== 13) {
        value = value * 1000
      }
    }
    const date = new Date(value)
    const dateNumFun = (num) => num < 10 ? `0${num}` : num
    const [Y, M, D, h, m, s] = [
      date.getFullYear(),
      dateNumFun(date.getMonth() + 1),
      dateNumFun(date.getDate()),
      dateNumFun(date.getHours()),
      dateNumFun(date.getMinutes()),
      dateNumFun(date.getSeconds())
    ]
    return `${Y}-${M}-${D} ${h}:${m}:${s}`
  }
  
  
  export function formatDateToWeek(value) {
    if (!value) {
      return ''
    }
    if (value instanceof Date) {
      value = value.getTime()
    } else {
      let tempStr = value + ''
      if (tempStr.length !== 13) {
        value = value * 1000
      }
    }
    const date = new Date(value)
    const dateNumFun = (num) => num < 10 ? `0${num}` : num
    const [Y, M, D, h, m, s] = [
      date.getFullYear(),
      dateNumFun(date.getMonth() + 1),
      dateNumFun(date.getDate()),
      dateNumFun(date.getHours()),
      dateNumFun(date.getMinutes()),
      dateNumFun(date.getSeconds())
    ]
    let day = date.getDay()
    let weeks = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六')
    let week = weeks[day]
    return `${Y} 年 ${M} 月 ${D} 日  ${week}`
  }
  
  export function shortRandomStr(prefix = 'node_') {
      const randomPart = Math.random().toString(36).substring(2, 7); // 生成一个 5 位的随机字符串
      return prefix + randomPart;
  }

  export function clacPXToVW(data) {
    let retV = window.innerWidth * data / 1920
    if (retV < data) {
      return retV + ''
    } else {
      return window.innerWidth * data / 1920 + ''
    }
  }


  export function rotateMatrixClockwise(matrix) {
    const n = matrix.length;
    const m = matrix[0].length;
    // Step 1: Reverse each row of the matrix
    const reversedMatrix = matrix.map(row => row.reverse());
    // Step 2: Transpose the matrix
    const rotatedMatrix = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            rotatedMatrix[j][i] = reversedMatrix[i][j];
        }
    }
    return rotatedMatrix.reverse()
}