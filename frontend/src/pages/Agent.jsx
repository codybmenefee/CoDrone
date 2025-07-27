import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material'

const Agent = () => {
  const { projectId } = useParams()

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          AI Agent
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get AI assistance for your photogrammetry analysis
        </Typography>
      </Box>

      <Paper sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            AI Agent Interface Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will provide an AI agent chat interface with:
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'left', display: 'inline-block' }}>
            <Typography variant="body2" color="text.secondary">
              • Natural language interaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Automated polygon drawing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Measurement calculations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Report generation assistance
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Agent