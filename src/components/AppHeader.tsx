import * as React from "react";
import {
    useEffect,
    useState,
    useCallback,
    useContext,
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
import {
    ModelInfo,
    getModelInfo
} from "../services/tabbyAPI";
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
//components
import SettingsDialog from "./SettingsDialog";
import AboutDialog from "./AboutDialog";
import ModelsDialog from "./ModelsDialog";
import { SaveConversationDialog } from "./SaveConversationDialog";
import { useReducerContext } from "../reducers/ReducerContext";

export default function AppHeader() {
    const { folders, currentConversationId, messages, dispatch } = useReducerContext();
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
        null
    );
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModels, setShowModels] = React.useState(false);
    const [showAbout, setShowAbout] = React.useState(false);
    const [showSave, setShowSave] = React.useState(false);
    const [serverUrl, setServerUrl] = useState(getPersistedServerUrl());
    const [apiKey, setApiKey] = useState(getPersistedApiKey());
    const [adminApiKey, setAdminApiKey] = useState(getPersistedAdminApiKey());
    const [generationParams, setGenerationParams] = useState(() =>
        getPersistedGenerationParams()
    );
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
                                setShowSave(true);
                            }}
                        >
                            Save
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
            <SaveConversationDialog
                open={showSave}
                onClose={() => setShowSave(false)}
                onSave={(format) => {
                    const currentConversation = folders
                        .flatMap(f => [...f.conversations, ...f.subfolders.flatMap(sf => sf.conversations)])
                        .find(c => c.id === currentConversationId);
                    
                    if (currentConversation) {
                        const content = {
                            name: currentConversation.name,
                            messages: messages
                        };
                        
                        // Create and trigger download
                        const getFormattedContent = () => {
                            switch (format) {
                                case 'json':
                                    return JSON.stringify(content, null, 2);
                                case 'txt':
                                    return content.messages
                                        .map(msg => `${msg.role}: ${msg.content.map((c: any) => c.text).join('\n')}`)
                                        .join('\n\n');
                                case 'md':
                                    return `# ${content.name}\n\n` +
                                        content.messages
                                            .map(msg => `**${msg.role}**:\n${msg.content.map((c: any) => c.text).join('\n')}`)
                                            .join('\n\n');
                                default:
                                    return '';
                            }
                        };
                        
                        const blob = new Blob(
                            [getFormattedContent()],
                            { type: 'text/plain' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${currentConversation.name}.${format}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                    setShowSave(false);
                }}
                conversation={{
                    name: folders
                        .flatMap(f => [...f.conversations, ...f.subfolders.flatMap(sf => sf.conversations)])
                        .find(c => c.id === currentConversationId)?.name || 'Untitled',
                    messages: messages
                }}
            />
        </>
    );
}
