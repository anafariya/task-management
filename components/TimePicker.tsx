import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Popover,
  Typography,
  Button,
  Paper,
  InputAdornment,
  styled,
  BoxProps,
  ButtonProps,
  IconButtonProps,
  TextFieldProps,
  Theme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// Type definitions for styled components
interface TimeOptionProps extends BoxProps {
  selected?: boolean;
}

interface PeriodButtonProps extends ButtonProps {
  selected?: boolean;
}

interface ScrollButtonProps extends IconButtonProps {
  position: 'top' | 'bottom';
}

// Styled components with proper TypeScript typings
const TimeScrollContainer = styled(Box)(() => ({
  height: 200,
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
  }
}));

const TimeOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<TimeOptionProps>(({ theme, selected }) => ({
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'all 0.2s',
  fontWeight: selected ? 500 : 400,
  color: selected ? theme.palette.primary.main : theme.palette.text.primary,
  backgroundColor: selected ? `${theme.palette.primary.light}20` : 'transparent',
  '&:hover': {
    backgroundColor: selected ? `${theme.palette.primary.light}30` : theme.palette.grey[100],
  }
}));

const PeriodButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<PeriodButtonProps>(({ theme, selected }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  fontWeight: selected ? 600 : 400,
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: selected ? `${theme.palette.primary.light}20` : 'transparent',
  '&:hover': {
    backgroundColor: selected ? `${theme.palette.primary.light}30` : theme.palette.grey[100],
  }
}));

const ScrollButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'position',
})<ScrollButtonProps>(({ theme, position }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  zIndex: 2,
  backgroundColor: `${theme.palette.background.paper}CC`,
  '&:hover': {
    backgroundColor: `${theme.palette.background.paper}EE`,
  },
  ...(position === 'top' && {
    top: 0,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }),
  ...(position === 'bottom' && {
    bottom: 0,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }),
}));

// Component props interface
interface CustomTimePickerProps {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  label = 'Time',
  disabled = false,
  fullWidth = true,
  required = false,
  variant = 'outlined'
}) => {
  // States
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hours, setHours] = useState<number>(value ? value.hour() % 12 || 12 : 12);
  const [minutes, setMinutes] = useState<number>(value ? value.minute() : 0);
  const [period, setPeriod] = useState<'AM' | 'PM'>(value ? (value.hour() >= 12 ? 'PM' : 'AM') : 'AM');
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Refs
  const hourScrollRef = useRef<HTMLDivElement | null>(null);
  const minuteScrollRef = useRef<HTMLDivElement | null>(null);
  
  // Options
  const hourOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions: number[] = Array.from({ length: 60 }, (_, i) => i);
  
  // Open state
  const open = Boolean(anchorEl);
  
  // Update display value when time changes
  useEffect(() => {
    if (value) {
      const formattedHours = (value.hour() % 12 || 12).toString();
      const formattedMinutes = value.minute().toString().padStart(2, '0');
      const ampm = value.hour() >= 12 ? 'PM' : 'AM';
      setDisplayValue(`${formattedHours}:${formattedMinutes} ${ampm}`);
      
      // Update internal state
      setHours(value.hour() % 12 || 12);
      setMinutes(value.minute());
      setPeriod(value.hour() >= 12 ? 'PM' : 'AM');
    } else {
      setDisplayValue('');
    }
  }, [value]);
  
  // Scroll to current values when picker opens
  useEffect(() => {
    if (open && hourScrollRef.current && minuteScrollRef.current) {
      setTimeout(() => {
        scrollToSelected(hourScrollRef, hours);
        scrollToSelected(minuteScrollRef, minutes);
      }, 50);
    }
  }, [open, hours, minutes]);
  
  // Helper functions
  const scrollToSelected = (ref: React.RefObject<HTMLDivElement>, value: number): void => {
    if (ref.current) {
      const itemHeight = 40;
      let scrollPosition: number;
      
      // Adjust for hour vs minute
      if (ref === hourScrollRef) {
        const index = hourOptions.findIndex(h => h === value);
        scrollPosition = index * itemHeight;
      } else {
        scrollPosition = value * itemHeight;
      }
      
      ref.current.scrollTop = scrollPosition - 80; // Center in view
    }
  };
  
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };
  
  const handleClose = (): void => {
    setAnchorEl(null);
  };
  
  const handleHourChange = (hour: number): void => {
    setHours(hour);
  };
  
  const handleMinuteChange = (minute: number): void => {
    setMinutes(minute);
  };
  
  const handlePeriodChange = (newPeriod: 'AM' | 'PM'): void => {
    setPeriod(newPeriod);
  };
  
  const handleApply = (): void => {
    let newHour = hours;
    if (period === 'PM' && hours < 12) newHour += 12;
    if (period === 'AM' && hours === 12) newHour = 0;
    
    let newValue: Dayjs;
    if (value) {
      newValue = value.hour(newHour).minute(minutes);
    } else {
      newValue = dayjs().hour(newHour).minute(minutes);
    }
    
    onChange(newValue);
    handleClose();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Try to parse the input
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM|am|pm)?$/;
    const match = inputValue.match(timeRegex);
    
    if (match) {
      const inputHours = parseInt(match[1], 10);
      const inputMinutes = parseInt(match[2], 10);
      const inputPeriod = match[3] ? match[3].toUpperCase() as 'AM' | 'PM' : period;
      
      let newHour = inputHours;
      if (inputPeriod === 'PM' && inputHours < 12) newHour += 12;
      if (inputPeriod === 'AM' && inputHours === 12) newHour = 0;
      
      let newValue: Dayjs;
      if (value) {
        newValue = value.hour(newHour).minute(inputMinutes);
      } else {
        newValue = dayjs().hour(newHour).minute(inputMinutes);
      }
      
      onChange(newValue);
    }
  };
  
  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'up' | 'down',
    options: number[],
    currentValue: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ): void => {
    if (ref.current) {
      let newIndex: number;
      if (ref === hourScrollRef) {
        const currentIndex = options.findIndex(h => h === currentValue);
        newIndex = direction === 'up' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(options.length - 1, currentIndex + 1);
        setter(options[newIndex]);
      } else {
        newIndex = direction === 'up'
          ? Math.max(0, currentValue - 1)
          : Math.min(59, currentValue + 1);
        setter(newIndex);
      }
      
      scrollToSelected(ref, ref === hourScrollRef ? options[newIndex] : newIndex);
    }
  };
  
  return (
    <>
      <TextField
        label={label}
        value={displayValue}
        onChange={handleInputChange}
        onClick={handleClick}
        error={error}
        helperText={helperText}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        variant={variant}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={handleClick}
                disabled={disabled}
                size="small"
              >
                <AccessTimeIcon />
              </IconButton>
            </InputAdornment>
          ),
          readOnly: false,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          }
        }}
      />
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: 280,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Hours</Typography>
            <Typography variant="subtitle2" color="text.secondary">Minutes</Typography>
            <Typography variant="subtitle2" color="text.secondary">AM/PM</Typography>
          </Box>
          
          {/* Picker container */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            {/* Hours */}
            <Box sx={{ width: 70, position: 'relative' }}>
              <ScrollButton
                position="top"
                size="small"
                onClick={() => handleScroll(hourScrollRef, 'up', hourOptions, hours, setHours)}
              >
                <KeyboardArrowUpIcon />
              </ScrollButton>
              
              <TimeScrollContainer ref={hourScrollRef}>
                {hourOptions.map((hour) => (
                  <TimeOption
                    key={hour}
                    selected={hour === hours}
                    onClick={() => handleHourChange(hour)}
                  >
                    {hour}
                  </TimeOption>
                ))}
              </TimeScrollContainer>
              
              <ScrollButton
                position="bottom"
                size="small"
                onClick={() => handleScroll(hourScrollRef, 'down', hourOptions, hours, setHours)}
              >
                <KeyboardArrowDownIcon />
              </ScrollButton>
            </Box>
            
            {/* Separator */}
            <Box sx={{ display: 'flex', alignItems: 'center', height: 200, mx: 1 }}>
              <Typography variant="h5" color="text.secondary">:</Typography>
            </Box>
            
            {/* Minutes */}
            <Box sx={{ width: 70, position: 'relative' }}>
              <ScrollButton
                position="top"
                size="small"
                onClick={() => handleScroll(minuteScrollRef, 'up', minuteOptions, minutes, setMinutes)}
              >
                <KeyboardArrowUpIcon />
              </ScrollButton>
              
              <TimeScrollContainer ref={minuteScrollRef}>
                {minuteOptions.map((minute) => (
                  <TimeOption
                    key={minute}
                    selected={minute === minutes}
                    onClick={() => handleMinuteChange(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </TimeOption>
                ))}
              </TimeScrollContainer>
              
              <ScrollButton
                position="bottom"
                size="small"
                onClick={() => handleScroll(minuteScrollRef, 'down', minuteOptions, minutes, setMinutes)}
              >
                <KeyboardArrowDownIcon />
              </ScrollButton>
            </Box>
            
            {/* AM/PM */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 60 }}>
              <PeriodButton
                selected={period === 'AM'}
                onClick={() => handlePeriodChange('AM')}
              >
                AM
              </PeriodButton>
              <Box sx={{ height: 8 }} />
              <PeriodButton
                selected={period === 'PM'}
                onClick={() => handlePeriodChange('PM')}
              >
                PM
              </PeriodButton>
            </Box>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleClose}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
                mr: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
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
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default CustomTimePicker;