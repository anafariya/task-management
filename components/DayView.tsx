import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Task } from '../types';
import { useSelector, useDispatch } from '../redux/hooks';
import { deleteTask, initializeFromStorage, setSelectedDate } from '../redux/taskSlice';
import {
  generateTimeSlots,
  timeToMinutes,
  formatTime,
  formatDate,
  getTodayDateString,
  isToday,
  getNextDay,
  getPreviousDay
} from '../utils/timeUtils';
import TaskItem from './TaskItem';
import AddTaskDialog from './AddTaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';

// Calculate position and height for task based on time
const calculateTaskPosition = (
  task: Task,
  startHour: number = 6,
  hourHeight: number = 60
) => {
  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);

  // Calculate minutes from startHour
  const startMinutes = Math.max(0, (startH - startHour) * 60 + startM);
  const endMinutes = Math.max(0, (endH - startHour) * 60 + endM);
  
  // Ensure minimum height for visibility
  const height = Math.max(30, endMinutes - startMinutes);

  return {
    top: `${startMinutes}px`,
    height: `${height}px`,
  };
};

const DayView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  
  const tasks = useSelector((state) => state.tasks.tasks);
  const selectedDate = useSelector((state) => state.tasks.selectedDate);
  const categories = useSelector((state) => state.tasks.categories);
  const isLoading = useSelector((state) => state.tasks.isLoading);
  
  const timeSlots = generateTimeSlots();
  
  // Extract start hour from the first time slot
  const timeMatch = timeSlots[0].match(/^(\d+):/);
  const startHour = timeMatch ? parseInt(timeMatch[1]) : 6;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(initializeFromStorage());
  }, [dispatch]);

  // Filter tasks by date, search query and category
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.date === selectedDate;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      
      return matchesDate && matchesSearch && matchesCategory;
    });
  }, [tasks, selectedDate, searchQuery, categoryFilter]);

  // Calculate position for current time indicator
  const getCurrentTimePosition = () => {
    if (!isToday(selectedDate)) return null;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Calculate minutes from startHour
    const currentMinutes = (hours - startHour) * 60 + minutes;
    if (currentMinutes < 0 || currentMinutes > (timeSlots.length * 60)) {
      return null; // Current time is outside visible range
    }
    
    return `${currentMinutes}px`;
  };
  
  const currentTimePosition = getCurrentTimePosition();

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

  const navigateToday = () => {
    dispatch(setSelectedDate(getTodayDateString()));
  };

  const navigatePrevious = () => {
    dispatch(setSelectedDate(getPreviousDay(selectedDate)));
  };

  const navigateNext = () => {
    dispatch(setSelectedDate(getNextDay(selectedDate)));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const completedCount = filteredTasks.filter(task => task.completed).length;

  // Update current time position every minute
  useEffect(() => {
    if (!isToday(selectedDate)) return;
    
    const interval = setInterval(() => {
      // This will trigger a re-render to update the current time indicator
      const newPosition = getCurrentTimePosition();
      if (newPosition !== currentTimePosition) {
        // Force re-render by using a state update
        setCategoryFilter(prev => prev); // Hack to force re-render
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [selectedDate, currentTimePosition]);

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: 1
            }}
          >
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Task Scheduler
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Organize your day efficiently
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              mt: { xs: 1, sm: 0 },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <TextField
                placeholder="Search tasks..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  width: { xs: '100%', sm: '200px' },
                  bgcolor: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    color: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  '& .MuiInputAdornment-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: 1,
                  },
                }}
              />
              
              <Tooltip title="Filter tasks">
                <IconButton 
                  color="inherit" 
                  onClick={toggleFilters}
                  sx={{
                    bgcolor: showFilters ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={handleAddTask}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                }}
              >
                Add Task
              </Button>
            </Box>
          </Box>
          
          {showFilters && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.color}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: cat.color,
                            mr: 1
                          }} 
                        />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Status:
                </Typography>
                <Chip 
                  label="All" 
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              </Box>
            </Box>
          )}
          
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color="inherit" 
                onClick={navigatePrevious}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  mr: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {formatDate(selectedDate)}
                {isToday(selectedDate) && (
                  <Chip 
                    label="Today" 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'medium',
                    }}
                  />
                )}
              </Typography>
              
              <IconButton 
                color="inherit" 
                onClick={navigateNext}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  ml: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
              
              {!isToday(selectedDate) && (
                <Tooltip title="Go to today">
                  <IconButton 
                    color="inherit" 
                    onClick={navigateToday}
                    size="small"
                    sx={{ 
                      ml: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                      }
                    }}
                  >
                    <TodayIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {filteredTasks.length > 0 && (
              <Box>
                <Chip 
                  label={`${completedCount}/${filteredTasks.length} completed`} 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ position: 'relative', height: `${timeSlots.length * 60}px`, overflow: 'hidden' }}>
          {/* Time slots */}
          {timeSlots.map((time, index) => (
            <Box
              key={time}
              sx={{
                display: 'flex',
                borderTop: index > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
                height: '60px',
                position: 'relative',
                bgcolor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.01)' : 'transparent',
              }}
            >
              <Box
                sx={{
                  width: '80px',
                  py: 1,
                  pr: 2,
                  textAlign: 'right',
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  fontWeight: 'medium',
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  zIndex: 2,
                  borderRight: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                {time}
              </Box>

              <Box sx={{ flexGrow: 1, position: 'relative' }} />
            </Box>
          ))}
          
          {/* Current time indicator */}
          {currentTimePosition && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: currentTimePosition,
                height: '2px',
                bgcolor: 'error.main',
                zIndex: 3,
                display: isToday(selectedDate) ? 'block' : 'none',
              }}
            />
          )}
          
          {/* Tasks */}
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={`skeleton-${index}`}
                sx={{
                  position: 'absolute',
                  left: '90px',
                  width: 'calc(100% - 110px)',
                  height: '80px',
                  top: `${120 + index * 150}px`,
                  zIndex: 10,
                  padding: '5px',
                }}
              >
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{ borderRadius: '6px' }}
                />
              </Box>
            ))
          ) : filteredTasks.length === 0 ? (
            // Empty state
            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                color: 'text.secondary',
                p: 3,
              }}
            >
              {searchQuery || categoryFilter !== 'all' ? (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    No matching tasks
                  </Typography>
                  <Typography variant="body2">
                    Try adjusting your search or filters
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {isToday(selectedDate) 
                      ? 'No tasks scheduled for today' 
                      : 'No tasks for this day'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Click the "Add Task" button to create your first task
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddTask}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                    }}
                  >
                    Add Task
                  </Button>
                </>
              )}
            </Box>
          ) : (
            // Render tasks
            filteredTasks.map((task) => {
              // Calculate position based on start hour
              const position = calculateTaskPosition(task, startHour);

              return (
                <Box
                  key={task.id}
                  sx={{
                    position: 'absolute',
                    left: '85px',
                    width: 'calc(100% - 100px)',
                    ...position,
                    zIndex: 10,
                    padding: '1px',
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

      {/* Floating action button for mobile */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add task"
            onClick={handleAddTask}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}

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