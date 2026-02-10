import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Paper } from '@mui/material';
import StepsForm from '../components/StepsForm';
import StepsList from '../components/StepsList';

function Steps() {
  const [tabValue, setTabValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStepsLogged = () => {
    // Trigger refresh of the steps list
    setRefreshKey(prev => prev + 1);
    // Switch to the list tab to see the new entry
    setTabValue(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="steps tabs">
          <Tab label="Log Steps" />
          <Tab label="View Steps" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <StepsForm onStepsLogged={handleStepsLogged} />
        )}
        {tabValue === 1 && (
          <StepsList key={refreshKey} />
        )}
      </Box>
    </Container>
  );
}

export default Steps;
