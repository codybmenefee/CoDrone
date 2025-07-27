import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import toast from 'react-hot-toast'

const Upload = () => {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.tif']
    },
    multiple: true,
  })

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (files.length < 3) {
      toast.error('At least 3 images are required for photogrammetry')
      return
    }

    setUploading(true)
    setActiveStep(1)

    try {
      const formData = new FormData()
      formData.append('project_name', projectName)
      formData.append('project_description', projectDescription)
      formData.append('user_id', 'user123') // TODO: Get from auth

      files.forEach((fileObj, index) => {
        formData.append('files', fileObj.file)
      })

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/upload/images', {
      //   method: 'POST',
      //   body: formData,
      // })
      
      // if (!response.ok) {
      //   throw new Error('Upload failed')
      // }

      // const result = await response.json()
      
      toast.success('Images uploaded successfully!')
      setActiveStep(2)
      
      // Navigate to project after a delay
      setTimeout(() => {
        navigate('/projects/1') // TODO: Use actual project ID
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
      setUploading(false)
      setActiveStep(0)
    }
  }

  const steps = [
    'Upload Images',
    'Processing',
    'Complete'
  ]

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Upload Drone Images
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new photogrammetry project by uploading your drone images
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploading images... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* File Upload Area */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Images
              </Typography>
              
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  or click to select files
                </Typography>
                <Button variant="outlined" color="primary">
                  Select Images
                </Button>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <InfoIcon sx={{ mr: 1 }} />
                Minimum 3 images required for photogrammetry. Supported formats: JPEG, PNG, TIFF
              </Alert>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Selected Files ({files.length})
                </Typography>
                
                <List>
                  {files.map((fileObj) => (
                    <ListItem
                      key={fileObj.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => removeFile(fileObj.id)}
                          disabled={uploading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <CameraIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={fileObj.file.name}
                        secondary={`${(fileObj.file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <Chip
                        label={fileObj.status}
                        color={fileObj.status === 'pending' ? 'default' : 'success'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Project Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Project Details
              </Typography>
              
              <TextField
                fullWidth
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={uploading}
                required
              />
              
              <TextField
                fullWidth
                label="Description (Optional)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
                disabled={uploading}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUpload}
                disabled={uploading || files.length < 3 || !projectName.trim()}
                startIcon={uploading ? null : <UploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Create Project'}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Tips
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Use high-quality images" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Ensure 60-80% overlap" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Avoid motion blur" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Consistent lighting" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Upload