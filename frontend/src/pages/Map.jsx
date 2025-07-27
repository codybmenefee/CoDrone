import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material'

const Map = () => {
  const { projectId } = useParams()

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Interactive Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize and analyze your spatial data
        </Typography>
      </Box>

      <Paper sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MapboxGL Integration Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will integrate MapboxGL for interactive map visualization with:
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'left', display: 'inline-block' }}>
            <Typography variant="body2" color="text.secondary">
              • Orthomosaic layer display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • NDVI/GNDVI visualization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Polygon drawing and measurement tools
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Layer switching and opacity controls
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Map