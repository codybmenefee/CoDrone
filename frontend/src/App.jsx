import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, Container } from '@mui/material'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Upload from './pages/Upload'
import Map from './pages/Map'
import Canvas from './pages/Canvas'
import Agent from './pages/Agent'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="upload" element={<Upload />} />
          <Route path="projects/:projectId/map" element={<Map />} />
          <Route path="projects/:projectId/canvas" element={<Canvas />} />
          <Route path="projects/:projectId/agent" element={<Agent />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  )
}

export default App