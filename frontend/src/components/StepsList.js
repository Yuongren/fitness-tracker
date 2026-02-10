import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TimerIcon from '@mui/icons-material/Timer';
import RouteIcon from '@mui/icons-material/Route';
import EditIcon from '@mui/icons-material/Edit';
import { stepsAPI } from '../services/api';

function StepsList() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      setLoading(true);
      console.log('👟 Fetching steps...');
      const response = await stepsAPI.getSteps();
      console.log('✅ Steps fetched:', response);
      setSteps(response);

      // Fetch summary
      const summary = await stepsAPI.getStepsSummary();
      console.log('📊 Summary fetched:', summary);
      setSummaryData(summary);
    } catch (err) {
      console.error('❌ Error fetching steps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (step) => {
    setStepToDelete(step);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (stepToDelete) {
      try {
        console.log(`👟 Deleting step entry ${stepToDelete.id}`);
        await stepsAPI.deleteSteps(stepToDelete.id);
        console.log('✅ Step entry deleted');
        setDeleteDialogOpen(false);
        setStepToDelete(null);
        fetchSteps();
      } catch (err) {
        console.error('❌ Error deleting step:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayData = summaryData[today] || { total_steps: 0, total_distance: 0, total_duration: 0 };

  // Calculate weekly stats
  let weeklySteps = 0;
  let weeklyDistance = 0;
  let weeklyDuration = 0;
  Object.values(summaryData).forEach(day => {
    weeklySteps += day.total_steps || 0;
    weeklyDistance += day.total_distance || 0;
    weeklyDuration += day.total_duration || 0;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <DirectionsWalkIcon sx={{ fontSize: 40, mr: 2, color: '#ff9800' }} />
        <Typography variant="h3" component="h1">
          Steps Tracker
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsWalkIcon sx={{ mr: 1, color: '#ff9800' }} />
                <Typography color="textSecondary">Today's Steps</Typography>
              </Box>
              <Typography variant="h5">
                {todayData.total_steps?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Daily goal: 10,000 steps
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ mr: 1, color: '#2196f3' }} />
                <Typography color="textSecondary">Weekly Duration</Typography>
              </Box>
              <Typography variant="h5">
                {weeklyDuration?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#f3e5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RouteIcon sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography color="textSecondary">Weekly Distance</Typography>
              </Box>
              <Typography variant="h5">
                {weeklyDistance?.toFixed(1) || '0.0'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                km
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsWalkIcon sx={{ mr: 1, color: '#4caf50' }} />
                <Typography color="textSecondary">Weekly Steps</Typography>
              </Box>
              <Typography variant="h5">
                {weeklySteps?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                7-day total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Steps Table */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6">Recent Steps</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : steps.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No steps logged yet. Start by logging your first walk!
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Steps</strong></TableCell>
                  <TableCell align="right"><strong>Duration (min)</strong></TableCell>
                  <TableCell align="right"><strong>Distance (km)</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {steps.map((step) => (
                  <TableRow key={step.id} hover>
                    <TableCell>{formatDate(step.date)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <DirectionsWalkIcon sx={{ mr: 1, fontSize: 20, color: '#ff9800' }} />
                        {step.steps?.toLocaleString() || 0}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {step.duration ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TimerIcon sx={{ mr: 1, fontSize: 20, color: '#2196f3' }} />
                          {step.duration}
                        </Box>
                      ) : (
                        <Typography color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {step.distance ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <RouteIcon sx={{ mr: 1, fontSize: 20, color: '#9c27b0' }} />
                          {step.distance.toFixed(1)}
                        </Box>
                      ) : (
                        <Typography color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(step)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Step Entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this step entry ({stepToDelete?.steps} steps)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StepsList;
