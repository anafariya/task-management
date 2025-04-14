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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Task, Category } from '../types';
import { useDispatch, useSelector } from '../redux/hooks';
import { addTask, editTask, clearError, setError } from '../redux/taskSlice';
import { v4 as uuidv4 } from 'uuid';
import { formatDuration, calculateDuration } from '../utils/timeUtils';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

// Slide transition component
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddTaskDialog = ({ open, onClose, task }: AddTaskDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [category, setCategory] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const dispatch = useDispatch();
  const error = useSelector((state) => state.tasks.error);
  const categories = useSelector((state) => state.tasks.categories);
  const selectedDate = useSelector((state) => state.tasks.selectedDate);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);

      // Parse start and end time
      const [startHours, startMinutes] = task.startTime.split(':').map(Number);
      const [endHours, endMinutes] = task.endTime.split(':').map(Number);

      setStartTime(dayjs().hour(startHours).minute(startMinutes));
      setEndTime(dayjs().hour(endHours).minute(endMinutes));
      setDate(dayjs(task.date));
    } else {
      resetForm();
    }
  }, [task, open]);

  // When the dialog opens, set the date to the currently selected date
  useEffect(() => {
    if (open && !task) {
      setDate(dayjs(selectedDate));
      
      // Set default start time (e.g., next hour)
      const now = dayjs();
      const nextHour = now.hour() + 1;
      setStartTime(dayjs().hour(nextHour).minute(0));
      setEndTime(dayjs().hour(nextHour + 1).minute(0));
      
      // Set default category if none selected
      if (!category && categories.length > 0) {
        setCategory(categories[0].color);
      }
    }
  }, [open, selectedDate, task, category, categories]);

  // Watch for changes in error state to handle dialog closing
  useEffect(() => {
    // If the error is cleared and we've attempted to submit the form, close the dialog
    if (!error && formSubmitted && open) {
      onClose();
      resetForm();
    }
  }, [error, formSubmitted, open, onClose]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime(null);
    setEndTime(null);
    setDate(dayjs(selectedDate));
    setCategory('');
    setFormSubmitted(false);
    dispatch(clearError());
  };

  const handleSubmit = () => {
    setFormSubmitted(true);

    if (!title.trim() || !startTime || !endTime || !date) {
      return;
    }

    if (startTime && endTime && !endTime.isAfter(startTime)) {
      dispatch(setError('End time must be after start time'));
      return;
    }

    if (!startTime || !endTime || !date) return;

    const formattedStartTime = startTime.format('HH:mm');
    const formattedEndTime = endTime.format('HH:mm');
    const formattedDate = date.format('YYYY-MM-DD');

    const taskData: Task = {
      id: task ? task.id : uuidv4(),
      title: title.trim(),
      description: description.trim(),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      date: formattedDate,
      category: category || (categories.length > 0 ? categories[0].color : ''),
      completed: task ? task.completed : false,
    };

    // Dispatch the action
    if (task) {
      dispatch(editTask(taskData));
    } else {
      dispatch(addTask(taskData));
    }

    // Close the dialog immediately if no error in Redux state
    if (!error) {
      onClose();
      resetForm();
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    onClose();
    resetForm();
  };

  // Calculate duration for display
  const getDuration = () => {
    if (startTime && endTime && endTime.isAfter(startTime)) {
      const start = startTime.format('HH:mm');
      const end = endTime.format('HH:mm');
      const duration = calculateDuration(start, end);
      return formatDuration(duration);
    }
    return null;
  };

  const duration = getDuration();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      PaperProps={{
        style: { 
          borderRadius: fullScreen ? '0' : '12px',
          overflow: 'hidden'
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="div">
          {task ? 'Edit Task' : 'Add Task'}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              fontWeight: 'medium',
              background: 'linear-gradient(45deg, #ffebee 0%, #ffcdd2 100%)',
              border: '1px solid #f44336',
              borderRadius: '8px',
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
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="dense"
          variant="outlined"
          error={formSubmitted && !title.trim()}
          helperText={formSubmitted && !title.trim() ? 'Title is required' : ''}
          sx={{ 
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />

        <FormControl fullWidth margin="dense" sx={{ mb: 2.5 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            sx={{ 
              borderRadius: '8px',
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
              }
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.color}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box 
                    sx={{ 
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: cat.color,
                      mr: 1,
                      flexShrink: 0
                    }} 
                  />
                  <Typography>{cat.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="dense"
          variant="outlined"
          sx={{ 
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1, fontWeight: 500 }}>
              Date
            </Typography>
            <DatePicker 
              value={date}
              onChange={(newValue) => setDate(newValue)}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  error: formSubmitted && !date,
                  helperText: formSubmitted && !date ? 'Date is required' : '',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                Start Time
              </Typography>
              <TimePicker
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                sx={{ 
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
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

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                End Time
              </Typography>
              <TimePicker
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                sx={{ 
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    error: formSubmitted && !endTime,
                    helperText:
                      formSubmitted && !endTime
                        ? 'End time is required'
                        : '',
                  },
                }}
              />
            </Box>
          </Box>
        </LocalizationProvider>

        {duration && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Chip 
              label={`Duration: ${duration}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #ff7e8a 30%, #ffb3a7 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #e05e6a 30%, #eb9080 90%)',
            },
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 3px 5px 2px rgba(255, 126, 138, .3)',
          }}
        >
          {task ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;