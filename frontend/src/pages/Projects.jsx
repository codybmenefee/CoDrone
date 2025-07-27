import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const Projects = () => {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your photogrammetry projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          New Project
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Projects page coming soon...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will display all your photogrammetry projects with filtering, search, and management capabilities.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Projects