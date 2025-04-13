'use client';

import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItem = ({ task, onEdit, onDelete }: TaskItemProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: task.color || '#3f51b5',
        color: 'white',
        borderRadius: '4px',
        padding: '8px',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{task.title}</Box>
      <Box sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
        {task.startTime.replace(':', '-')} - {task.endTime.replace(':', '-')}
      </Box>
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '4px', 
          right: '4px',
          display: 'flex',
        }}
      >
        <IconButton 
          size="small" 
          onClick={onEdit}
          sx={{ color: 'white', padding: '2px' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={onDelete}
          sx={{ color: 'white', padding: '2px' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TaskItem;