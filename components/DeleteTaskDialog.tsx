import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
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

const DeleteTaskDialog = ({ open, onClose, onConfirm }: DeleteTaskDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
          bgcolor: 'error.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="div">
          Delete Task
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: '24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'error.light',
              color: 'error.main',
              mr: 2,
            }}
          >
            <DeleteOutlineIcon fontSize="large" />
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
              Confirm Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. Are you sure you want to delete this task?
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'medium',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'medium',
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTaskDialog;