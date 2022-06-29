/* eslint-disable no-plusplus */
import React from 'react';
import ReactECharts from 'echarts-for-react';

function Page() {
  const left = -5;
  const horizontal = [];
  const vertical = [];
  for (let i = 0; i < left / 2; i++) {
    horizontal.push(`${(i)}π`);
    vertical.push(Math.cos(i * Math.PI));
    // horizontal.push(i);
    // vertical.push(2.718281828 ** i + (2.718281828 ** (-i)));
    i -= 1.01;
  }
  const right = 5;
  for (let i = 0; i < right / 2; i++) {
    horizontal.push(`${(i)}π`); // 0π,0.01π..
    vertical.push(Math.cos(i * Math.PI));
    i -= 0.99;
  }
  console.log(horizontal);
  console.log(vertical);
  const options = {
    grid: {
      top: 8, right: 8, bottom: 24, left: 36,
    },
    xAxis: {
      type: 'category',
      data: horizontal,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: vertical,
        type: 'line',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  };

  return <ReactECharts option={options} />;
}

export default Page;
