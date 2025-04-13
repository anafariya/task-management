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
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Task } from '../types';
import { useDispatch, useSelector } from '../redux/hooks';
import { addTask, editTask, clearError } from '../redux/taskSlice';
import { v4 as uuidv4 } from 'uuid';
import { timeToMinutes } from '../utils/timeUtils';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const AddTaskDialog = ({ open, onClose, task }: AddTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const dispatch = useDispatch();
  const error = useSelector(state => state.tasks.error);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStartTime(task.startTime);
      setEndTime(task.endTime);
    } else {
      resetForm();
    }
  }, [task, open]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    dispatch(clearError());
  };
  
  const handleSubmit = () => {
    // Convert time to proper format if needed (e.g., add AM/PM if not present)
    let formattedStartTime = startTime;
    let formattedEndTime = endTime;
    
    // Basic validation
    if (!title.trim()) return;
    if (!formattedStartTime || !formattedEndTime) return;
    
    const taskData: Task = {
      id: task ? task.id : uuidv4(),
      title,
      description,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      color: task?.color
    };
    
    if (task) {
      dispatch(editTask(taskData));
    } else {
      dispatch(addTask(taskData));
    }
    
    if (!error) {
      onClose();
      resetForm();
    }
  };
  
  const handleClose = () => {
    onClose();
    resetForm();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        style: { borderRadius: '8px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add Task
        <Button 
          onClick={handleClose} 
          sx={{ minWidth: 'auto', padding: '4px' }}
          color="inherit"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
        />
        
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="dense"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ mb: 1, fontWeight: 500 }}>Start Time</Box>
          <TextField
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="9:00"
            variant="outlined"
          />
        </Box>
        
        <Box>
          <Box sx={{ mb: 1, fontWeight: 500 }}>End Time</Box>
          <TextField
            fullWidth
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="10:00"
            variant="outlined"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          sx={{ 
            bgcolor: '#007BFF',
            '&:hover': {
              bgcolor: '#0069d9',
            },
            borderRadius: '4px',
            textTransform: 'none'
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;