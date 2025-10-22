/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import '../assets/Home.css';
import {
  BsFillPlayCircleFill,
  BsSkipForward,
  BsSkipBackward,
  BsMicFill,
  BsStopCircleFill,
  BsPauseCircleFill,
} from 'react-icons/bs';

import HomeTable from './HomeTable';
import HomeNavigation from './HomeNavigation';
import HomeList from './HomeList';
import AudioWaveform from './AudioWaveform';
import apiService from '../services/api';
import audioRecorder from '../services/audioRecorder';

export default function Home() {
  const [materials, setMaterials] = useState([]);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [latestRecording, setLatestRecording] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [waveformSimilarity, setWaveformSimilarity] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    const isHealthy = await apiService.healthCheck();
    setServerStatus(isHealthy ? 'connected' : 'disconnected');
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      loadMaterialDetails(materials[currentMaterialIndex].id);
    }
  }, [currentMaterialIndex, materials]);

  const loadMaterials = async () => {
    try {
      const materialsList = await apiService.getMaterials();
      setMaterials(materialsList);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const loadMaterialDetails = async (materialId) => {
    setWaveformSimilarity(null);
    setLatestRecording(null);
    try {
      const material = await apiService.getMaterialFile(materialId);
      setCurrentMaterial(material);
    } catch (error) {
      console.error('Failed to load material details:', error);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (currentMaterialIndex < materials.length - 1) {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentMaterialIndex > 0) {
      setCurrentMaterialIndex(currentMaterialIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioRecorder.stopRecording();
        const result = await apiService.uploadRecording(
          audioBlob,
          currentMaterial?.id || ''
        );

        if (currentMaterial) {
          const evaluation = await apiService.getEvaluationScore(
            result.record_id,
            currentMaterial.id
          );
          const newRecording = {
            ...result,
            evaluation,
            material_title: currentMaterial.title,
          };
          setRecordings((prev) => [...prev, newRecording]);
          setLatestRecording(newRecording);
        }

        setIsRecording(false);
      } catch (error) {
        console.error('Failed to stop recording:', error);
        setIsRecording(false);
      }
    } else {
      try {
        await audioRecorder.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Failed to access microphone. Please check permissions.');
      }
    }
  };

  const handleMaterialSelect = (materialId) => {
    const index = materials.findIndex((material) => material.id === materialId);
    if (index !== -1) {
      setCurrentMaterialIndex(index);
      setIsPlaying(false);
      setWaveformSimilarity(null);
      setLatestRecording(null);
    }
  };

  return (
    <div className="home-body">
      <div className="top-container">
        <div className="top-left">
          Point3 Learning Tool
        </div>
        <div className="top-right">
          <span className={`server-status ${serverStatus}`}>
            Server: {serverStatus}
          </span>
          {currentMaterial && (
            <span className="material-level">
              Level {currentMaterial.level}
            </span>
          )}
        </div>
      </div>

      <div className="mid-container">
        <div className="item-list">
          <div className="item-list-content">
            <HomeList
              materials={materials}
              onSelect={handleMaterialSelect}
              selectedId={materials[currentMaterialIndex]?.id}
            />
          </div>
        </div>

        <div className="audio-body">
          {currentMaterial ? (
            <>
              <div className="audio-text">
                <h2>{currentMaterial.title}</h2>
                <p>
                  {currentMaterial.text}
                </p>
              </div>

              <div className="audio-waveform-container">
                <AudioWaveform
                  currentMaterial={currentMaterial}
                  latestRecording={latestRecording}
                  onSimilarityChange={setWaveformSimilarity}
                />
              </div>

              <div className="audio-button-container">
                <div className="audio-button-mid">
                  <BsSkipBackward
                    size={38}
                    onClick={handlePrevious}
                    style={{ cursor: 'pointer', opacity: currentMaterialIndex > 0 ? 1 : 0.3 }}
                  />
                  {isPlaying ? (
                    <BsPauseCircleFill
                      size={48}
                      onClick={handlePlayPause}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <BsFillPlayCircleFill
                      size={48}
                      onClick={handlePlayPause}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <BsSkipForward
                    size={38}
                    onClick={handleNext}
                    style={{
                      cursor: 'pointer',
                      opacity: currentMaterialIndex < materials.length - 1 ? 1 : 0.3
                    }}
                  />
                </div>
                <div className="audio-mic">
                  {isRecording ? (
                    <BsStopCircleFill
                      size={48}
                      onClick={handleRecordToggle}
                      style={{ cursor: 'pointer', color: '#f44336' }}
                    />
                  ) : (
                    <BsMicFill
                      size={48}
                      onClick={handleRecordToggle}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>

              <audio
                ref={audioRef}
                src={`http://127.0.0.1:5000${currentMaterial.audio_url}`}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            </>
          ) : (
            <div className="audio-placeholder">
              Select a material to get started.
            </div>
          )}
        </div>

        <div className="mid-right">
          <div className="similarity-card">
            <h3>Similarity</h3>
            <span>
              {waveformSimilarity !== null ? `${waveformSimilarity.toFixed(1)}%` : '--'}
            </span>
          </div>
          <div className="home-table-wrapper">
            <HomeTable recordings={recordings} />
          </div>
        </div>
      </div>

      <div className="bottom-container">
        <HomeNavigation currentMaterial={currentMaterial} />
      </div>
    </div>
  );
}
