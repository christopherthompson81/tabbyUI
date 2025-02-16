import * as React from "react";
import {
    useEffect,
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
    Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
    ModelInfo,
    getModelInfo
} from "../services/tabbyAPI";
import {
    getPersistedServerUrl,
    persistServerUrl,
    getPersistedApiKey,
    persistApiKey,
    persistGenerationParam,
    persistAdminApiKey,
} from "../utils/persistence";
//components
import SettingsDialog from "./SettingsDialog";
import AboutDialog from "./AboutDialog";
import ModelsDialog from "./ModelsDialog";
import HelpDialog from "./HelpDialog";
import { useReducerContext } from "../reducers/ReducerContext";

export default function AppHeader() {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
        null
    );
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModels, setShowModels] = React.useState(false);
    const [showAbout, setShowAbout] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);
    const { settings, dispatch } = useReducerContext();
    const [serverStatus, setServerStatus] = useState<
        "checking" | "online" | "offline"
    >("checking");
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

    const mainMenuClose = () => {
        setMenuAnchorEl(null);
    };

    // Bootstrap conversations and periodic status checks
    useEffect(() => {
        const checkStatus = async () => {
            setServerStatus("checking");
            const model = await getModelInfo(getPersistedServerUrl(), getPersistedApiKey());
            if (model) {
                setServerStatus("online");
                setModelInfo(model);
            } else {
                setServerStatus("offline");
                setModelInfo(null);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

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
                                setShowHelp(true);
                            }}
                        >
                            Help
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
                        <Tooltip title={modelInfo?.parameters ? JSON.stringify(modelInfo.parameters, null, 2) : ""}>
                            <Typography variant="caption">
                                {serverStatus === "online"
                                    ? `Online (${modelInfo?.id || "Unknown"})`
                                    : serverStatus === "offline"
                                        ? "Offline"
                                        : "Checking..."}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
            <SettingsDialog
                open={showSettings}
                onClose={() => {
                    persistServerUrl(settings.serverUrl);
                    persistApiKey(settings.apiKey);
                    persistAdminApiKey(settings.adminApiKey);
                    Object.entries(settings.generationParams).forEach(([key, value]) => {
                        persistGenerationParam(key, value.toString());
                    });
                    setShowSettings(false);
                }}
                serverUrl={settings.serverUrl}
                onServerUrlChange={(e) => dispatch({ type: 'SET_SERVER_URL', url: e.target.value })}
                apiKey={settings.apiKey}
                onApiKeyChange={(e) => dispatch({ type: 'SET_API_KEY', key: e.target.value })}
                adminApiKey={settings.adminApiKey}
                onAdminApiKeyChange={(e) => dispatch({ type: 'SET_ADMIN_API_KEY', key: e.target.value })}
                generationParams={settings.generationParams}
                onGenerationParamsChange={useCallback((key, value) => {
                    dispatch({ type: 'SET_GENERATION_PARAM', key, value });
                }, [dispatch])}
            />
            <ModelsDialog
                open={showModels}
                onClose={() => setShowModels(false)}
                serverUrl={settings.serverUrl}
                adminApiKey={settings.adminApiKey}
            />
            <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
            <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
}
