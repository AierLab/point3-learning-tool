/* eslint-disable no-plusplus */
import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Chip } from '@mui/material';
import apiService from '../services/api';

function AudioWaveform({ currentMaterial, latestRecording, onSimilarityChange }) {
  const [referenceWaveform, setReferenceWaveform] = useState([]);
  const [userWaveform, setUserWaveform] = useState([]);
  const [loading, setLoading] = useState(false);
  const [similarity, setSimilarity] = useState(null);

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

  useEffect(() => {
    if (referenceWaveform.length && userWaveform.length) {
      const value = calculateSimilarity(referenceWaveform, userWaveform);
      setSimilarity(value);
      if (onSimilarityChange) {
        onSimilarityChange(value);
      }
    } else {
      setSimilarity(null);
      if (onSimilarityChange) {
        onSimilarityChange(null);
      }
    }
  }, [referenceWaveform, userWaveform, onSimilarityChange]);

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

        for (let i = 0; i < samples; i += 1) {
          const start = i * blockSize;
          const end = start + blockSize;
          let sum = 0;

          for (let j = start; j < end && j < channelData.length; j += 1) {
            sum += Math.abs(channelData[j]);
          }

          waveform.push(blockSize > 0 ? sum / blockSize : 0);
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
    for (let i = 0; i < 500; i += 1) {
      data.push(Math.sin(i * 0.1) * 0.5 + 0.5);
    }
    return data;
  };

  const calculateSimilarity = (reference, user) => {
    const targetLength = Math.min(reference.length, user.length, 500);
    if (targetLength === 0) {
      return null;
    }

    const resample = (arr) => {
      if (arr.length === targetLength) {
        return arr;
      }
      const result = [];
      for (let i = 0; i < targetLength; i += 1) {
        const index = Math.floor((i / targetLength) * arr.length);
        result.push(arr[Math.min(index, arr.length - 1)]);
      }
      return result;
    };

    const normalize = (arr) => {
      const maxValue = Math.max(...arr, 0);
      if (maxValue === 0) {
        return arr.map(() => 0);
      }
      return arr.map((value) => value / maxValue);
    };

    const refNorm = normalize(resample(reference));
    const usrNorm = normalize(resample(user));

    let dot = 0;
    let magRef = 0;
    let magUsr = 0;

    for (let i = 0; i < targetLength; i += 1) {
      const refVal = refNorm[i];
      const usrVal = usrNorm[i];
      dot += refVal * usrVal;
      magRef += refVal * refVal;
      magUsr += usrVal * usrVal;
    }

    if (!magRef || !magUsr) {
      return 0;
    }

    const cosine = dot / (Math.sqrt(magRef) * Math.sqrt(magUsr));
    const bounded = Math.min(Math.max(cosine, 0), 1);
    return Number((bounded * 100).toFixed(1));
  };

  const maxAmplitude = useMemo(() => {
    const maxRef = referenceWaveform.length ? Math.max(...referenceWaveform) : 0;
    const maxUsr = userWaveform.length ? Math.max(...userWaveform) : 0;
    const maxValue = Math.max(maxRef, maxUsr, 0.1);
    return Math.min(Math.max(maxValue * 1.15, 0.2), 1.5);
  }, [referenceWaveform, userWaveform]);

  const chartOptions = useMemo(() => {
    const series = [];
    const hasUserData = userWaveform.length > 0;
    const hasReferenceData = referenceWaveform.length > 0;

    const maxLength = Math.max(referenceWaveform.length, userWaveform.length, 100);
    const timeAxis = Array.from({ length: maxLength }, (_, index) => `${((index / maxLength) * 100).toFixed(0)}%`);

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
        left: 30,
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
        min: 0,
        max: maxAmplitude,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
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
  }, [referenceWaveform, userWaveform, maxAmplitude]);

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

      {!loading && similarity !== null && (
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <Chip
            label={`Similarity ${similarity}%`}
            color="success"
            size="small"
          />
        </Box>
      )}

      <ReactECharts
        option={chartOptions}
        style={{ height: '100%', width: '100%' }}
        notMerge
        lazyUpdate
      />
    </Box>
  );
}

export default AudioWaveform;
