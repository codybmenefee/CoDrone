import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material'

const Canvas = () => {
  const { projectId } = useParams()

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Report Canvas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and edit professional reports with AI assistance
        </Typography>
      </Box>

      <Paper sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            GrapesJS Integration Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will integrate GrapesJS for visual report editing with:
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'left', display: 'inline-block' }}>
            <Typography variant="body2" color="text.secondary">
              • Drag-and-drop report builder
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Image and chart components
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • AI-powered content generation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Export to PDF functionality
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Canvas