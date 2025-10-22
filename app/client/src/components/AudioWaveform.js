/* eslint-disable no-plusplus */
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Chip } from '@mui/material';
import apiService from '../services/api';

function AudioWaveform({ currentMaterial, latestRecording }) {
  const [referenceWaveform, setReferenceWaveform] = useState([]);
  const [userWaveform, setUserWaveform] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentMaterial?.audio_url) {
      loadReferenceWaveform(currentMaterial.audio_url);
    }
  }, [currentMaterial]);

  useEffect(() => {
    if (latestRecording?.record_id) {
      loadUserWaveform(latestRecording.record_id);
    }
  }, [latestRecording]);

  const loadReferenceWaveform = async (audioUrl) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000${audioUrl}`);
      const audioBlob = await response.blob();
      const waveformData = await extractWaveform(audioBlob);
      setReferenceWaveform(waveformData);
    } catch (error) {
      console.error('Failed to load reference waveform:', error);
      setReferenceWaveform(generatePlaceholderWaveform());
    } finally {
      setLoading(false);
    }
  };

  const loadUserWaveform = async (recordId) => {
    try {
      const data = await apiService.getWavePattern(recordId);
      setUserWaveform(data.smoothed || data.waveform || []);
    } catch (error) {
      console.error('Failed to load user waveform:', error);
      setUserWaveform([]);
    }
  };

  const extractWaveform = async (audioBlob) => new Promise((resolve) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const audioBuffer = await audioContext.decodeAudioData(e.target.result);
        const channelData = audioBuffer.getChannelData(0);

        const samples = 500;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform = [];

        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          const end = start + blockSize;
          let sum = 0;

          for (let j = start; j < end && j < channelData.length; j++) {
            sum += Math.abs(channelData[j]);
          }

          waveform.push(sum / blockSize);
        }

        resolve(waveform);
      } catch (error) {
        console.error('Error decoding audio:', error);
        resolve(generatePlaceholderWaveform());
      }
    };

    reader.readAsArrayBuffer(audioBlob);
  });

  const generatePlaceholderWaveform = () => {
    const data = [];
    for (let i = 0; i < 500; i++) {
      data.push(Math.sin(i * 0.1) * 0.5 + 0.5);
    }
    return data;
  };

  const getOptions = () => {
    const series = [];
    const hasUserData = userWaveform.length > 0;
    const hasReferenceData = referenceWaveform.length > 0;

    const maxLength = Math.max(referenceWaveform.length, userWaveform.length, 100);
    const timeAxis = Array.from({ length: maxLength }, (_, i) =>
      ((i / maxLength) * 100).toFixed(0) + '%'
    );

    if (hasReferenceData) {
      series.push({
        name: 'Reference Audio',
        data: referenceWaveform,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#2196f3',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
              { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        }
      });
    }

    if (hasUserData) {
      series.push({
        name: 'Your Recording',
        data: userWaveform,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#f44336',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 67, 54, 0.3)' },
              { offset: 1, color: 'rgba(244, 67, 54, 0.05)' }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        }
      });
    }

    return {
      title: {
        text: hasUserData ? 'Pronunciation Comparison' : 'Reference Pronunciation',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      grid: {
        top: 60,
        right: 40,
        bottom: 60,
        left: 60,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: timeAxis,
        boundaryGap: false,
        name: 'Time',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          interval: Math.floor(maxLength / 10),
        }
      },
      yAxis: {
        type: 'value',
        name: 'Amplitude',
        nameLocation: 'middle',
        nameGap: 40,
        min: 0,
        max: 1
      },
      series,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params) => {
          let html = `<strong>Time: ${params[0].name}</strong><br/>`;
          params.forEach((param) => {
            html += `${param.marker} ${param.seriesName}: ${param.value.toFixed(3)}<br/>`;
          });
          return html;
        }
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 10,
        icon: 'roundRect'
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100,
          bottom: 30
        }
      ]
    };
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
        >
          <Typography>Loading waveform...</Typography>
        </Box>
      )}

      {!loading && userWaveform.length > 0 && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <Chip
            label="Comparison View"
            color="success"
            size="small"
          />
        </Box>
      )}

      <ReactECharts
        option={getOptions()}
        style={{ height: '100%', width: '100%' }}
        notMerge
        lazyUpdate
      />
    </Box>
  );
}

export default AudioWaveform;
