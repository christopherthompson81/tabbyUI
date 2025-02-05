import React from 'react';
import {
    AppBar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ModelInfo } from "../services/tabbyAPI";

interface AppHeaderProps {
    serverStatus: "checking" | "online" | "offline";
    modelInfo: ModelInfo | null;
}

export default function AppHeader({
    serverStatus,
    modelInfo,
}: AppHeaderProps) {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModels, setShowModels] = React.useState(false);
    const [showAbout, setShowAbout] = React.useState(false);

    const mainMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    id="main-menu-button"
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    id="main-menu"
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={mainMenuClose}
                    MenuListProps={{
                        "aria-labelledby": "main-menu-button",
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            mainMenuClose();
                            setShowSettings(true);
                        }}
                    >
                        Settings
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            mainMenuClose();
                            setShowModels(true);
                        }}
                    >
                        Models
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            mainMenuClose();
                            setShowAbout(true);
                        }}
                    >
                        About
                    </MenuItem>
                </Menu>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    tabbyUI
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor:
                                serverStatus === "online"
                                    ? "lime"
                                    : serverStatus === "offline"
                                        ? "red"
                                        : "orange",
                        }}
                    />
                    <Typography variant="caption">
                        {serverStatus === "online"
                            ? `Online (${modelInfo?.id || "Unknown"})`
                            : serverStatus === "offline"
                                ? "Offline"
                                : "Checking..."}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
