import * as React from "react";
import {
    Box,
    Divider,
    IconButton,
    Radio,
    RadioGroup,
    styled,
    Tooltip,
} from "@mui/material";

const StyledRadio = styled(Radio)(({}) => ({
    padding: 0,
    "& .MuiSvgIcon-root": {
        fontSize: 24,
    },
}));

interface IconButtonWrapperProps {
    selected?: boolean;
}

const IconButtonWrapper = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== "selected",
})<IconButtonWrapperProps>(({ theme, selected }) => ({
    borderRadius: "24px",
    padding: theme.spacing(1.5),
    margin: theme.spacing(0.5),
    backgroundColor: selected ? theme.palette.action.selected : "transparent",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "& svg": {
        fontSize: "1.5rem",
        color: selected
            ? theme.palette.primary.contrastText
            : theme.palette.primary.contrastText,
        strokeWidth: selected ? 1.5 : 1,
    },
}));

interface IconRadioGroupProps {
    options: {
        value: string;
        icon: React.ReactNode;
        tooltip?: string;
    }[];
    value: string;
    onChange: (value: string) => void;
}

export default function IconRadioGroup({
    options,
    value,
    onChange,
}: IconRadioGroupProps) {
    return (
        <RadioGroup
            row
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{
                display: "inline-flex",
                alignItems: "flex-start",
                backgroundColor: (theme) => theme.palette.primary.main,
                borderRadius: "28px",
                padding: "4px",
            }}
        >
            {options.map((option, index) => (
                <React.Fragment key={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Tooltip title={option.tooltip || ""} arrow>
                            <StyledRadio
                                value={option.value}
                                icon={
                                    <IconButtonWrapper
                                        selected={value === option.value}
                                    >
                                        {option.icon}
                                    </IconButtonWrapper>
                                }
                                checkedIcon={
                                    <IconButtonWrapper
                                        selected={value === option.value}
                                    >
                                        {option.icon}
                                    </IconButtonWrapper>
                                }
                                disableRipple
                            />
                        </Tooltip>
                        {index < options.length - 1 && (
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                    height: "24px",
                                    mx: 0,
                                    borderColor: (theme) =>
                                        theme.palette.divider,
                                }}
                            />
                        )}
                    </Box>
                </React.Fragment>
            ))}
        </RadioGroup>
    );
}
