'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Task } from '../types';
import { useSelector, useDispatch } from '../redux/hooks';
import { deleteTask, initializeFromStorage } from '../redux/taskSlice';
import {
  generateTimeSlots,
  timeToMinutes,
  formatTime,
} from '../utils/timeUtils';
import TaskItem from './TaskItem';
import AddTaskDialog from './AddTaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';

// Calculate position and height for task based on time
const calculateTaskPosition = (
  task: Task,
  startHour: number = 8,
  hourHeight: number = 60
) => {
  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);

  const startMinutes = (startH - startHour) * 60 + startM;
  const endMinutes = (endH - startHour) * 60 + endM;
  const height = endMinutes - startMinutes;

  return {
    top: `${startMinutes}px`,
    height: `${height}px`,
  };
};

const DayView = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.tasks);
  const timeSlots = generateTimeSlots();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(initializeFromStorage());
  }, [dispatch]);
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTask = () => {
    setEditingTask(undefined);
    setAddDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setAddDialogOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      dispatch(deleteTask(taskToDelete));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h6'>{timeSlots[0]}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder='Search tasks...'
              size='small'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box
                    component='span'
                    sx={{ color: 'action.active', mr: 1, mt: 0.5 }}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <circle cx='11' cy='11' r='8'></circle>
                      <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                    </svg>
                  </Box>
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{ width: '200px' }}
            />
            <Button
              startIcon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='12' y1='5' x2='12' y2='19'></line>
                  <line x1='5' y1='12' x2='19' y2='12'></line>
                </svg>
              }
              variant='contained'
              sx={{
                bgcolor: '#007BFF',
                '&:hover': {
                  bgcolor: '#0069d9',
                },
                borderRadius: '4px',
                textTransform: 'none',
              }}
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', mt: 2 }}>
          {/* Time slots */}
          {timeSlots.map((time, index) => (
            <Box
              key={time}
              sx={{
                display: 'flex',
                borderTop: '1px solid #e0e0e0',
                height: '60px',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: '80px',
                  py: 1,
                  pr: 2,
                  textAlign: 'right',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {time}
              </Box>

              <Box sx={{ flexGrow: 1 }} />
            </Box>
          ))}
          // In the same component, update your tasks rendering:
          {filteredTasks.length === 0 ? (
            <Box
              sx={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                color: 'text.secondary',
              }}
            >
              <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
                {searchQuery ? 'No matching tasks' : 'No tasks for today'}
              </Typography>
              <Typography variant='body2'>
                {searchQuery
                  ? 'Try a different search'
                  : 'Start by adding one!'}
              </Typography>
            </Box>
          ) : (
            filteredTasks.map((task) => {
              const position = calculateTaskPosition(task);

              return (
                <Box
                  key={task.id}
                  sx={{
                    position: 'absolute',
                    left: '85px',
                    width: 'calc(100% - 100px)',
                    ...position,
                    zIndex: 10,
                  }}
                >
                  <TaskItem
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteClick(task.id)}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </Paper>

      <AddTaskDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        task={editingTask}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default DayView;
