'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteTaskDialog = ({ open, onClose, onConfirm }: DeleteTaskDialogProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: { borderRadius: '8px' }
      }}
    >
      <DialogTitle>Delete Task</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this task?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="primary"
          sx={{ 
            bgcolor: '#007BFF',
            '&:hover': {
              bgcolor: '#0069d9',
            },
            borderRadius: '4px',
            textTransform: 'none'
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTaskDialog;