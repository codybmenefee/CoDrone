export default function HomePage() {
  return (
    <div>
      <h1>Canopy Copilot API Server</h1>
      <p>The API server is running successfully.</p>
      <p>Available endpoints:</p>
      <ul>
        <li>POST /api/chat - Chat with AI assistant</li>
        <li>POST /api/spatial/volume - Volume calculations</li>
        <li>POST /api/spatial/area - Area calculations</li>
        <li>POST /api/spatial/elevation - Elevation analysis</li>
        <li>POST /api/upload - File uploads</li>
        <li>GET /api/files - List uploaded files</li>
        <li>GET /api/sessions - List chat sessions</li>
      </ul>
    </div>
  );
}
