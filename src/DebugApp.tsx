function DebugApp() {
  const debugStyle = {
    padding: '20px',
    background: 'red',
    color: 'white',
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    border: '5px solid blue'
  };

  return (
    <div style={debugStyle}>
      <h1>🚨 DEBUG APP - REACT IS WORKING! 🚨</h1>
      <p>If you can see this red box, React is working correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <button onClick={() => alert('Button clicked!')} style={{padding: '10px', fontSize: '16px'}}>
        Test Button
      </button>
    </div>
  );
}

export default DebugApp;
