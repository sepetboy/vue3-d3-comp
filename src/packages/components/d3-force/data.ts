export const nodes = [
  {
    id: "100",
    type: "attack_ip",
    label: "182.22.33.24",
    alert_count: 10,
    first_alert_time: 1723428466832,
    latest_alert_time: 1723428466832,
  },
  {
    id: "101",
    type: "attack_ip",
    label: "123.456.789.191",
    alert_count: 1,
    first_alert_time: 1723428466832,
    latest_alert_time: 1723428466832,
  },
  {
    id: "300",
    type: "domain",
    label: "受害者网站域名",
    company_name: "受害者单位名称",
    alert_count: 11,
    first_alert_time: 1723428466832,
    latest_alert_time: 1723428466832,
  },
  {
    id: "200",
    type: "victim_ip",
    label: "192.168.100.102",
    company_name: "受害者单位名称",
    alert_count: 11,
    first_alert_time: 1723428466832,
    latest_alert_time: 1723428466832,
  },
  {
    id: "400",
    type: "url",
    label: "www.baidu.com",
    company_name: "受害者单位名称",
    alert_count: 11,
    first_alert_time: 1723428466832,
    latest_alert_time: 1723428466832,
  },
];

export const edges = [
  {
    source: "101",
    target: "200",
  },
  {
    source: "101",
    target: "400",
  },
  {
    source: "100",
    target: "200",
  },
  {
    source: "100",
    target: "400",
  },
];

export const options = {
  el: ".d3-force",
  width: 1920,
  height: 1080,
};
