'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { Task } from '../types';
import { useDispatch, useSelector } from '../redux/hooks';
import { addTask, editTask, clearError, setError } from '../redux/taskSlice';
import { v4 as uuidv4 } from 'uuid';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const AddTaskDialog = ({ open, onClose, task }: AddTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  // Add a form submitted flag
  const [formSubmitted, setFormSubmitted] = useState(false);

  const dispatch = useDispatch();
  const error = useSelector((state) => state.tasks.error);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);

      const [startHours, startMinutes] = task.startTime.split(':').map(Number);
      const [endHours, endMinutes] = task.endTime.split(':').map(Number);

      setStartTime(dayjs().hour(startHours).minute(startMinutes));
      setEndTime(dayjs().hour(endHours).minute(endMinutes));
    } else {
      resetForm();
    }
  }, [task, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime(null);
    setEndTime(null);
    setFormSubmitted(false); // Reset form submitted flag
    dispatch(clearError());
  };

  const handleSubmit = () => {
    setFormSubmitted(true);

    if (!title.trim() || !startTime || !endTime) {
      return;
    }

    if (startTime && endTime && !endTime.isAfter(startTime)) {
      dispatch(setError('End time must be after start time'));
      return;
    }

    if (!startTime || !endTime) return;

    const formattedStartTime = startTime.format('HH:mm');
    const formattedEndTime = endTime.format('HH:mm');

    const taskData: Task = {
      id: task ? task.id : uuidv4(),
      title,
      description,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      color: task?.color,
    };

    if (task) {
      dispatch(editTask(taskData));
    } else {
      dispatch(addTask(taskData));
    }

    // Critical change: Don't close immediately - wait for error state to update
    setTimeout(() => {
      // Get latest error state
      const currentError = useSelector((state) => state.tasks.error);
      if (!currentError) {
        onClose();
        resetForm();
      }
    }, 100);
  };

  const handleClose = () => {
    dispatch(clearError());
    onClose();
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        style: { borderRadius: '8px' },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        {task ? 'Edit Task' : 'Add Task'}
        <IconButton
          edge='end'
          color='inherit'
          onClick={handleClose}
          aria-label='close'
          size='small'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '0 24px 20px 24px' }}>
        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ffebee 0%, #ffcdd2 100%)',
              border: '1px solid #f44336',
              borderRadius: '4px',
              '& .MuiAlert-icon': {
                color: '#d32f2f',
              },
              '& .MuiAlert-message': {
                color: '#d32f2f',
                fontSize: '0.95rem',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          label='Title'
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin='dense'
          variant='outlined'
          error={formSubmitted && !title.trim()}
          helperText={formSubmitted && !title.trim() ? 'Title is required' : ''}
          sx={{ mb: 2 }}
        />

        <TextField
          label='Description'
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin='dense'
          variant='outlined'
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 1, fontWeight: 500 }}>Start Time</Box>
            <TimePicker
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  error: formSubmitted && !startTime,
                  helperText:
                    formSubmitted && !startTime ? 'Start time is required' : '',
                },
              }}
            />
          </Box>

          <Box>
            <Box sx={{ mb: 1, fontWeight: 500 }}>End Time</Box>
            <TimePicker
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  error:
                    formSubmitted &&
                    !endTime
                    ,
                  helperText:
                    formSubmitted && !endTime
                      ? 'End time is required'
                      : formSubmitted &&
                        startTime &&
                        endTime &&
                        !endTime.isAfter(startTime)
                      ? 'End time must be after start time'
                      : '',
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button
          onClick={handleClose}
          color='inherit'
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #00B0FF 90%)',
            },
            borderRadius: '4px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          {task ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
