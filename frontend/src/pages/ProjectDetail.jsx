import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Map as MapIcon,
  Edit as CanvasIcon,
  SmartToy as AgentIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material'

const ProjectDetail = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Farm Field Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Project ID: {projectId}
        </Typography>
        <Chip label="Completed" color="success" />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Overview" />
            <Tab label="Map" />
            <Tab label="Canvas" />
            <Tab label="AI Agent" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Project Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Project Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: January 15, 2024
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Images: 24 files
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: Processing complete
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Quick Actions
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<MapIcon />}
                          onClick={() => navigate(`/projects/${projectId}/map`)}
                        >
                          View Map
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CanvasIcon />}
                          onClick={() => navigate(`/projects/${projectId}/canvas`)}
                        >
                          Edit Report
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AgentIcon />}
                          onClick={() => navigate(`/projects/${projectId}/agent`)}
                        >
                          AI Agent
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Interactive Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Map view coming soon...
              </Typography>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Report Canvas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Canvas editor coming soon...
              </Typography>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                AI Agent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI agent interface coming soon...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProjectDetail