import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import OrganizeDialog from "./OrganizeDialog";
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
import LoRAsDialog from "./LoRAsDialog";

// Local Imports
import { useReducerContext } from "../reducers/ReducerContext";
import { ModelInfo, getModelInfo } from "../services/tabbyAPI";
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

export default function AppHeader() {
    const { settings, dispatch } = useReducerContext();
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
        null
    );
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModels, setShowModels] = React.useState(false);
    const [showAbout, setShowAbout] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);
    const [showOrganize, setShowOrganize] = React.useState(false);
    const [showLoRAs, setShowLoRAs] = React.useState(false);
    const [serverStatus, setServerStatus] = useState<
        "checking" | "online" | "offline" | "no_model"
    >("checking");
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const tooltipContent = modelInfo?.parameters ? (
        Object.entries(modelInfo.parameters).map(([key, value]) => {
            if (key != "prompt_template_content" && value) {
                return (
                    <tr key={key}>
                        <td>
                            <strong>{key}: </strong>
                        </td>
                        <td>{value}</td>
                    </tr>
                );
            }
            return null;
        })
    ) : (
        <></>
    );
    const mainMenuClose = () => {
        setMenuAnchorEl(null);
    };

    // Bootstrap conversations and periodic status checks
    useEffect(() => {
        const checkStatus = async () => {
            setServerStatus("checking");
            const modelStatus = await getModelInfo(
                getPersistedServerUrl(),
                getPersistedApiKey()
            );
            setServerStatus(modelStatus.status);
            setModelInfo(modelStatus.info);
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
                                setShowOrganize(true);
                            }}
                        >
                            Organize
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                mainMenuClose();
                                setShowLoRAs(true);
                            }}
                        >
                            LoRAs
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
                                        : serverStatus === "no_model"
                                        ? "orange"
                                        : "orange",
                            }}
                        />
                        <Tooltip
                            title={
                                <table>
                                    <tbody>{tooltipContent}</tbody>
                                </table>
                            }
                        >
                            <Typography variant="caption">
                                {serverStatus === "online"
                                    ? `Online (${modelInfo?.id || "Unknown"})`
                                    : serverStatus === "offline"
                                    ? "Offline"
                                    : serverStatus === "no_model"
                                    ? "No Model Loaded"
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
                    Object.entries(settings.generationParams).forEach(
                        ([key, value]) => {
                            persistGenerationParam(key, value.toString());
                        }
                    );
                    setShowSettings(false);
                }}
                serverUrl={settings.serverUrl}
                onServerUrlChange={(e) =>
                    dispatch({ type: "SET_SERVER_URL", url: e.target.value })
                }
                apiKey={settings.apiKey}
                onApiKeyChange={(e) =>
                    dispatch({ type: "SET_API_KEY", key: e.target.value })
                }
                adminApiKey={settings.adminApiKey}
                onAdminApiKeyChange={(e) =>
                    dispatch({ type: "SET_ADMIN_API_KEY", key: e.target.value })
                }
                generationParams={settings.generationParams}
                onGenerationParamsChange={useCallback(
                    (key, value) => {
                        dispatch({ type: "SET_GENERATION_PARAM", key, value });
                    },
                    [dispatch]
                )}
            />
            <ModelsDialog
                open={showModels}
                onClose={() => setShowModels(false)}
                serverUrl={settings.serverUrl}
                adminApiKey={settings.adminApiKey}
            />
            <OrganizeDialog
                open={showOrganize}
                onClose={() => setShowOrganize(false)}
            />
            <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} />
            <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
            <LoRAsDialog open={showLoRAs} onClose={() => setShowLoRAs(false)} />
        </>
    );
}
