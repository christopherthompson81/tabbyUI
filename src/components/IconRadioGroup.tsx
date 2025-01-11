import React from 'react';
import { Box, Divider, IconButton, Radio, RadioGroup, styled } from '@mui/material';

const StyledRadio = styled(Radio)(({ theme }) => ({
  padding: 0,
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
}));

const IconButtonWrapper = styled(IconButton)(({ theme, selected }) => ({
  borderRadius: '24px',
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& svg': {
    fontSize: '1.5rem',
    color: selected ? theme.palette.text.primary : theme.palette.text.secondary,
    strokeWidth: selected ? 1.5 : 1,
  },
}));

interface IconRadioGroupProps {
  options: {
    value: string;
    icon: React.ReactNode;
  }[];
  value: string;
  onChange: (value: string) => void;
}

export default function IconRadioGroup({ options, value, onChange }: IconRadioGroupProps) {
  return (
    <RadioGroup
      row
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: '28px',
        padding: '4px',
      }}
    >
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StyledRadio
              value={option.value}
              icon={
                <IconButtonWrapper selected={value === option.value}>
                  {option.icon}
                </IconButtonWrapper>
              }
              checkedIcon={
                <IconButtonWrapper selected={value === option.value}>
                  {option.icon}
                </IconButtonWrapper>
              }
              disableRipple
            />
            {index < options.length - 1 && (
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  height: '24px', 
                  mx: 1,
                  borderColor: (theme) => theme.palette.divider 
                }} 
              />
            )}
          </Box>
        </React.Fragment>
      ))}
    </RadioGroup>
  );
}
