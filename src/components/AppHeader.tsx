import * as React from "react";
import {
    useState,
    useCallback,
} from "react";
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
import {
    getPersistedServerUrl,
    persistServerUrl,
    getPersistedApiKey,
    persistApiKey,
    getPersistedGenerationParams,
    persistGenerationParam,
    persistAdminApiKey,
    getPersistedAdminApiKey,
} from "../utils/persistence";
//componets
import SettingsDialog from "./SettingsDialog";
import AboutDialog from "./AboutDialog";
import ModelsDialog from "./ModelsDialog";

interface AppHeaderProps {
    serverStatus: "checking" | "online" | "offline";
    modelInfo: ModelInfo | null;
}

export default function AppHeader({ serverStatus, modelInfo }: AppHeaderProps) {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
        null
    );
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModels, setShowModels] = React.useState(false);
    const [showAbout, setShowAbout] = React.useState(false);
    const [serverUrl, setServerUrl] = useState(getPersistedServerUrl());
    const [apiKey, setApiKey] = useState(getPersistedApiKey());
    const [adminApiKey, setAdminApiKey] = useState(getPersistedAdminApiKey());
    const [generationParams, setGenerationParams] = useState(() =>
        getPersistedGenerationParams()
    );

    const mainMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
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
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
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
            <SettingsDialog
                open={showSettings}
                onClose={() => {
                    persistServerUrl(serverUrl);
                    persistApiKey(apiKey);
                    persistAdminApiKey(adminApiKey);
                    Object.entries(generationParams).forEach(([key, value]) => {
                        persistGenerationParam(key, value.toString());
                    });
                    setShowSettings(false);
                }}
                serverUrl={serverUrl}
                onServerUrlChange={(e) => setServerUrl(e.target.value)}
                apiKey={apiKey}
                onApiKeyChange={(e) => setApiKey(e.target.value)}
                adminApiKey={adminApiKey}
                onAdminApiKeyChange={(e) => setAdminApiKey(e.target.value)}
                generationParams={generationParams}
                onGenerationParamsChange={useCallback((key, value) => {
                    setGenerationParams((prev) => ({
                        ...prev,
                        [key]: value,
                    }));
                }, [])}
            />
            <ModelsDialog
                open={showModels}
                onClose={() => setShowModels(false)}
                serverUrl={serverUrl}
                adminApiKey={adminApiKey}
            />
            <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
}
