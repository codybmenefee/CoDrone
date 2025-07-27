import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Folder as ProjectsIcon,
  Map as MapIcon,
  Edit as CanvasIcon,
  SmartToy as AgentIcon,
  TrendingUp as TrendingUpIcon,
  PhotoCamera as CameraIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material'

const Dashboard = () => {
  const navigate = useNavigate()

  // Mock data - replace with actual API calls
  const stats = {
    totalProjects: 12,
    activeProjects: 3,
    totalImages: 156,
    processingJobs: 2,
  }

  const recentProjects = [
    {
      id: '1',
      name: 'Farm Field Analysis',
      status: 'completed',
      lastUpdated: '2 hours ago',
      imageCount: 24,
    },
    {
      id: '2',
      name: 'Construction Site Survey',
      status: 'processing',
      lastUpdated: '1 day ago',
      imageCount: 18,
    },
    {
      id: '3',
      name: 'Forest Health Assessment',
      status: 'uploading',
      lastUpdated: '3 days ago',
      imageCount: 32,
    },
  ]

  const quickActions = [
    {
      title: 'Upload Images',
      description: 'Start a new photogrammetry project',
      icon: <UploadIcon />,
      color: 'primary',
      action: () => navigate('/upload'),
    },
    {
      title: 'View Projects',
      description: 'Browse all your projects',
      icon: <ProjectsIcon />,
      color: 'secondary',
      action: () => navigate('/projects'),
    },
    {
      title: 'AI Agent',
      description: 'Get AI assistance',
      icon: <AgentIcon />,
      color: 'success',
      action: () => navigate('/projects/1/agent'),
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'uploading':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'uploading':
        return 'Uploading'
      default:
        return status
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back! 🌱
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your AI-powered photogrammetry workspace
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ProjectsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.activeProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CameraIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalImages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Images
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.processingJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing Jobs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
        </Grid>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                },
              }}
              onClick={action.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {action.description}
                </Typography>
                <Button
                  variant="outlined"
                  color={action.color}
                  startIcon={<PlayIcon />}
                  size="small"
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Projects */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Projects
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate('/projects')}
                >
                  View All
                </Button>
              </Box>
              
              <List>
                {recentProjects.map((project, index) => (
                  <React.Fragment key={project.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                      }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ProjectsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={project.name}
                        secondary={`${project.imageCount} images • ${project.lastUpdated}`}
                      />
                      <Chip
                        label={getStatusText(project.status)}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <MapIcon />
                      </IconButton>
                      <IconButton size="small">
                        <CanvasIcon />
                      </IconButton>
                    </ListItem>
                    {index < recentProjects.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Processing Status
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Farm Field Analysis</Typography>
                  <Typography variant="body2" color="text.secondary">
                    75%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Construction Site</Typography>
                  <Typography variant="body2" color="text.secondary">
                    45%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<AgentIcon />}
                onClick={() => navigate('/projects/1/agent')}
              >
                Get AI Assistance
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard