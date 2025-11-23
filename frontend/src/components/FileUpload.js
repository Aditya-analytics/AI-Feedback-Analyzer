import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onAnalysisComplete, onError, loading, setLoading }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (!file) {
      onError('No file selected');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      onError('Please upload a CSV file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onAnalysisComplete(response.data);
      } else {
        onError('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to analyze file. Please check your file format and try again.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onAnalysisComplete, onError, setLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: loading
  });

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h2>📁 Step 1: Upload Your Data</h2>
        
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        >
          <input {...getInputProps()} />
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing reviews...</p>
              <p className="loading-subtext">This may take a moment</p>
            </div>
          ) : isDragActive ? (
            <div className="drag-active-state">
              <p>📥 Drop the CSV file here</p>
            </div>
          ) : (
            <div className="default-state">
              <div className="upload-icon">📤</div>
              <p className="upload-title">Drag & drop your CSV file here</p>
              <p className="upload-subtitle">or click to browse</p>
              <div className="file-requirements">
                <p>✓ CSV file required</p>
                <p>✓ Must contain a "review" column</p>
                <p>✓ One review per row</p>
              </div>
            </div>
          )}
        </div>

        <div className="example-section">
          <h3>📝 Expected CSV Format</h3>
          <div className="example-table">
            <table>
              <thead>
                <tr>
                  <th>review</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>The teaching quality is excellent and the campus is beautiful.</td>
                </tr>
                <tr>
                  <td>Poor infrastructure and unresponsive administration.</td>
                </tr>
                <tr>
                  <td>Great learning environment with helpful faculty.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="example-note">
            💡 <strong>Tip:</strong> Column name is case-insensitive (review, Review, REVIEW all work)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
