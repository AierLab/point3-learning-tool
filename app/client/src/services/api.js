/**
 * API Service for Point3 Learning Tool
 * Handles all communication with the Flask backend
 */

const API_BASE_URL = 'http://127.0.0.1:5000';

class ApiService {
  async getMaterials(levels = null) {
    try {
      let url = `${API_BASE_URL}/material/list`;
      if (levels && levels.length > 0) {
        url += `?levels=${levels.join(',')}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch materials');
      }

      return data.materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  async getMaterialFile(materialId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/material/file?id=${materialId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch material file');
      }

      return data.material;
    } catch (error) {
      console.error('Error fetching material file:', error);
      throw error;
    }
  }

  async uploadRecording(audioBlob, materialId = '') {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('material_id', materialId);

      const response = await fetch(`${API_BASE_URL}/record/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload recording');
      }

      return data;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  async getWavePattern(recordId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/eval/wavepattern?id=${recordId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch wave pattern');
      }

      return data;
    } catch (error) {
      console.error('Error fetching wave pattern:', error);
      throw error;
    }
  }

  async getEvaluationScore(recordId, materialId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/eval/score?record_id=${recordId}&material_id=${materialId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch evaluation score');
      }

      return data.evaluation;
    } catch (error) {
      console.error('Error fetching evaluation score:', error);
      throw error;
    }
  }

  getAudioUrl(type, filename) {
    return `${API_BASE_URL}/audio/${type}/${filename}`;
  }

  async uploadReferenceAudio(audioBlob, materialId, text = null) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'reference.wav');
      formData.append('material_id', materialId);
      if (typeof text === 'string') {
        formData.append('text', text);
      }

      const response = await fetch(`${API_BASE_URL}/reference/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload reference audio');
      }

      return data;
    } catch (error) {
      console.error('Error uploading reference audio:', error);
      throw error;
    }
  }

  async deleteReferenceAudio(materialId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reference/delete?material_id=${materialId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete reference audio');
      }

      return data;
    } catch (error) {
      console.error('Error deleting reference audio:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

const apiService = new ApiService();
export default apiService;
