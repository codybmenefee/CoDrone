import React from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material'
import { Home as HomeIcon } from '@mui/icons-material'

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'primary.main', mb: 2 }}>
            404
          </Typography>
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Typography>
          
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
          >
            Go Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NotFound