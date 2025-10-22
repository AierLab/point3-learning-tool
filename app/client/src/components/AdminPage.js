/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  BsMicFill,
  BsStopCircleFill,
  BsPlayCircleFill,
  BsPauseCircleFill,
} from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import apiService from '../services/api';
import audioRecorder from '../services/audioRecorder';

export default function AdminPage() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedMaterialDetails, setSelectedMaterialDetails] = useState(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [audioElement, setAudioElement] = useState(null);
  const [levelsFilter, setLevelsFilter] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const levels = levelsFilter
        ? levelsFilter.split(',').map((level) => parseInt(level.trim(), 10)).filter((n) => !Number.isNaN(n))
        : null;
      const materialsList = await apiService.getMaterials(levels);
      setMaterials(materialsList);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load materials' });
    }
  };

  const handleRecordClick = async (material) => {
    setSelectedMaterial(material);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsRecordDialogOpen(true);
    setMessage({ type: '', text: '' });

    try {
      const details = await apiService.getMaterialFile(material.id);
      setSelectedMaterialDetails(details);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load material details' });
    }
  };

  const handleStartRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setMessage({ type: 'info', text: 'Recording... Speak the text clearly.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to access microphone' });
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await audioRecorder.stopRecording();
      setRecordedBlob(blob);
      const url = audioRecorder.createAudioUrl(blob);
      setRecordedUrl(url);
      setIsRecording(false);
      setMessage({ type: 'success', text: 'Recording completed! You can play it back or upload.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to stop recording' });
      setIsRecording(false);
    }
  };

  const handlePlayRecording = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob || !selectedMaterial) return;

    setUploading(true);
    try {
      const textValue = selectedMaterialDetails?.text;
      const textForUpload =
        typeof textValue === 'string' && textValue.trim().length > 0
          ? textValue
          : null;

      await apiService.uploadReferenceAudio(
        recordedBlob,
        selectedMaterial.id,
        textForUpload
      );

      setMessage({ type: 'success', text: 'Reference audio uploaded successfully!' });

      setTimeout(() => {
        loadMaterials();
        handleCloseDialog();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload reference audio' });
      setUploading(false);
    }
  };

  const handleDeleteReference = async (materialId) => {
    try {
      await apiService.deleteReferenceAudio(materialId);
      setMessage({ type: 'success', text: 'Reference audio removed (restored backup if available).' });
      loadMaterials();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete reference audio' });
    }
  };

  const handleCloseDialog = () => {
    setIsRecordDialogOpen(false);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsPlaying(false);
    setUploading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel - Reference Voice Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Record high-quality reference pronunciations to replace placeholder audio files.
          Students will hear your recordings when learning.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Filter by levels (e.g., 1,2,3)"
            value={levelsFilter}
            onChange={(event) => setLevelsFilter(event.target.value)}
            size="small"
          />
          <Button variant="outlined" onClick={loadMaterials}>
            Apply Filter
          </Button>
        </Box>
      </Paper>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxHeight: '65vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Learning Materials ({materials.length})
        </Typography>

        <List sx={{ mt: 2, flex: 1, overflowY: 'auto' }}>
          {materials.map((material) => (
            <ListItem
              key={material.id}
              divider
              secondaryAction={(
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<BsMicFill />}
                    onClick={() => handleRecordClick(material)}
                    sx={{ mr: 1 }}
                  >
                    Record
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteReference(material.id)}
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              )}
            >
              <ListItemText
                primary={(
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{material.title}</Typography>
                    <Chip
                      label={`Level ${material.level}`}
                      size="small"
                      color={material.level <= 2 ? 'success' : material.level <= 4 ? 'warning' : 'error'}
                    />
                  </Box>
                )}
                secondary={(
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {material.length.toFixed(1)}s
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {material.update_time}
                    </Typography>
                  </Box>
                )}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={isRecordDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Record Reference Audio
          {selectedMaterial && (
            <Chip
              label={`Level ${selectedMaterial.level}`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>

        <DialogContent>
          {selectedMaterial && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedMaterial.title}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  {selectedMaterialDetails?.text || 'Loading text...'}
                </Typography>
              </Paper>
            </Box>
          )}

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, my: 3 }}>
            {!isRecording && !recordedBlob && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<BsMicFill size={24} />}
                onClick={handleStartRecording}
                sx={{ px: 4, py: 2 }}
              >
                Start Recording
              </Button>
            )}

            {isRecording && (
              <>
                <Typography variant="h6" color="error">
                  🔴 Recording...
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<BsStopCircleFill size={24} />}
                  onClick={handleStopRecording}
                  sx={{ px: 4, py: 2 }}
                >
                  Stop Recording
                </Button>
              </>
            )}

            {recordedBlob && !isRecording && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={isPlaying ? <BsPauseCircleFill size={24} /> : <BsPlayCircleFill size={24} />}
                  onClick={handlePlayRecording}
                >
                  {isPlaying ? 'Pause' : 'Play Back'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<BsMicFill size={24} />}
                  onClick={handleStartRecording}
                >
                  Record Again
                </Button>
              </Box>
            )}
          </Box>

          {uploading && <LinearProgress sx={{ my: 2 }} />}

          {recordedUrl && (
            <audio
              ref={(el) => setAudioElement(el)}
              src={recordedUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadRecording}
            variant="contained"
            color="primary"
            disabled={!recordedBlob || uploading}
          >
            Upload & Replace
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
