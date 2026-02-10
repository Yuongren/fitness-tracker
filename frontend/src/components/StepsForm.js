import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import { stepsAPI } from '../services/api';

function StepsForm({ onStepsLogged }) {
  const [formData, setFormData] = useState({
    steps: '',
    duration: '',
    distance: '',
    date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required field
      if (!formData.steps || formData.steps === '') {
        setError('Steps count is required');
        setLoading(false);
        return;
      }

      // Prepare data - only include fields with values
      const data = {
        steps: parseInt(formData.steps)
      };

      if (formData.duration && formData.duration !== '') {
        data.duration = parseInt(formData.duration);
      }

      if (formData.distance && formData.distance !== '') {
        data.distance = parseFloat(formData.distance);
      }

      if (formData.date && formData.date !== '') {
        data.date = formData.date;
      }

      if (formData.notes && formData.notes !== '') {
        data.notes = formData.notes;
      }

      console.log('📝 Submitting steps:', data);

      const response = await stepsAPI.logSteps(data);
      
      setSuccess(`✅ Steps logged successfully! (${data.steps} steps recorded)`);
      
      // Reset form
      setFormData({
        steps: '',
        duration: '',
        distance: '',
        date: '',
        notes: ''
      });

      // Notify parent component
      if (onStepsLogged) {
        onStepsLogged();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error logging steps:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to log steps';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DirectionsWalkIcon sx={{ fontSize: 40, mr: 2, color: '#ff9800' }} />
          <Typography variant="h4" component="h1">
            Log Steps
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Steps Count"
            type="number"
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            placeholder="Enter number of steps"
            margin="normal"
            required
            inputProps={{ min: '0', step: '1' }}
            helperText="Required field"
          />

          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Optional: Time spent walking"
            margin="normal"
            inputProps={{ min: '0', step: '1' }}
            helperText="Optional - duration of activity in minutes"
          />

          <TextField
            fullWidth
            label="Distance (km)"
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            placeholder="Optional: Distance covered"
            margin="normal"
            inputProps={{ min: '0', step: '0.1' }}
            helperText="Optional - distance covered in kilometers"
          />

          <TextField
            fullWidth
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Optional - leave empty for today"
          />

          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional: Any notes about this activity"
            margin="normal"
            multiline
            rows={3}
            helperText="Optional notes"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Logging...' : 'Log Steps'}
          </Button>
        </form>

        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            💡 <strong>Tips:</strong>
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Average person walks ~5 km/hour</li>
            <li>~1,300 steps = 1 km</li>
            <li>Log multiple times a day to track different walking sessions</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
}

export default StepsForm;
