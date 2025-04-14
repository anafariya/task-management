import { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Tooltip, 
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Task } from '../types';
import { formatTime } from '../utils/timeUtils';
import { useDispatch } from '../redux/hooks';
import { toggleTaskCompletion } from '../redux/taskSlice';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItem = ({ task, onEdit, onDelete }: TaskItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleTaskCompletion(task.id));
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        background: task.category || 'linear-gradient(135deg, #ff7e8a 0%, #ffb3a7 100%)',
        color: 'white',
        borderRadius: '6px',
        padding: '8px 10px',
        width: '100%',
        height: '100%',
        minHeight: '30px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        opacity: task.completed ? 0.7 : 1,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 0.5
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          textDecoration: task.completed ? 'line-through' : 'none',
          opacity: task.completed ? 0.8 : 1,
          width: '70%'
        }}>
          <Checkbox 
            checked={task.completed}
            onClick={handleToggleComplete}
            size="small"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              p: 0.5,
              mr: 0.5,
              '&.Mui-checked': {
                color: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          />
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.9rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {task.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Edit task">
            <IconButton 
              size="small" 
              onClick={onEdit}
              sx={{ 
                color: 'white', 
                p: '2px',
                mx: 0.2
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete task">
            <IconButton 
              size="small" 
              onClick={onDelete}
              sx={{ 
                color: 'white', 
                p: '2px',
                mx: 0.2
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '0.8rem',
        opacity: 0.9
      }}>
        <ScheduleIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
        <Typography variant="body2" component="span">
          {formatTime(task.startTime)} - {formatTime(task.endTime)}
        </Typography>
      </Box>
      
      {task.description && (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem',
            opacity: 0.85,
            mt: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {task.description}
        </Typography>
      )}
    </Box>
  );
};

export default TaskItem;