import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (files) => {
    setUploading(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setUploading(false);
    fetchDocuments();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <h1 className="mb-4">Document Upload</h1>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <div
                className={`border-2 border-dashed rounded p-4 text-center ${
                  dragActive ? 'border-primary bg-light' : 'border-secondary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mb-3">
                  <i className="fas fa-cloud-upload-alt fa-3x text-muted"></i>
                </div>
                <h5>Drag and drop your tax documents here</h5>
                <p className="text-muted">or</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="d-none"
                  id="fileInput"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="fileInput" className="btn btn-primary">
                  Choose Files
                </label>
                <p className="small text-muted mt-2">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>

              {uploading && (
                <div className="mt-3">
                  <div className="progress">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      style={{width: '100%'}}
                    >
                      Uploading...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Uploaded Documents</h5>
            </div>
            <div className="card-body">
              {documents.length === 0 ? (
                <p className="text-muted">No documents uploaded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Type</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.filename}</td>
                          <td>{doc.file_type}</td>
                          <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Document Types</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  W-2 Forms
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  1099 Forms
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  1098 Forms
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Receipts
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Bank Statements
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Investment Statements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;