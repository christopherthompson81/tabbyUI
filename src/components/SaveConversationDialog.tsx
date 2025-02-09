import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import { exportToMarkdown, exportToDocx, exportToPdf } from '../utils/exportUtils';
                                                                                                                                                                       
 interface SaveConversationDialogProps {                                                                                                                               
     open: boolean;                                                                                                                                                    
     onClose: () => void;                                                                                                                                              
     onSave: (format: string) => void;                                                                                                                                 
     conversation: {                                                                                                                                                   
         name: string;                                                                                                                                                 
         messages: any[];                                                                                                                                              
     };                                                                                                                                                                
 }                                                                                                                                                                     
                                                                                                                                                                       
 export const SaveConversationDialog: React.FC<SaveConversationDialogProps> = ({                                                                                       
     open,                                                                                                                                                             
     onClose,                                                                                                                                                          
     onSave,                                                                                                                                                           
     conversation                                                                                                                                                      
 }) => {                                                                                                                                                               
     const [selectedFormat, setSelectedFormat] = React.useState('json');                                                                                               
                                                                                                                                                                       
     const getPreview = () => {                                                                                                                                        
         switch (selectedFormat) {                                                                                                                                     
             case 'json':                                                                                                                                              
                 return JSON.stringify(conversation, null, 2);                                                                                                         
             case 'txt':                                                                                                                                               
                 return conversation.messages                                                                                                                          
                     .map(msg => `${msg.role}: ${msg.content.map((c: any) => c.text).join('\n')}`)                                                                     
                     .join('\n\n');                                                                                                                                    
             case 'md':                                                                                                                                                
                 return `# ${conversation.name}\n\n` +                                                                                                                 
                     conversation.messages                                                                                                                             
                         .map(msg => `**${msg.role}**:\n${msg.content.map((c: any) => c.text).join('\n')}`)                                                            
                         .join('\n\n');                                                                                                                                
             default:                                                                                                                                                  
                 return '';                                                                                                                                            
         }                                                                                                                                                             
     };                                                                                                                                                                
                                                                                                                                                                       
     return (                                                                                                                                                          
         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>                                                                                                
             <DialogTitle>Save Conversation</DialogTitle>                                                                                                              
             <DialogContent>                                                                                                                                           
                <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Choose Export Format
                    </Typography>
                    <List>
                        {formats.map((format) => (
                            <ListItem
                                button
                                key={format}
                                onClick={() => handleExport(format)}
                            >
                                <ListItemText 
                                    primary={format.toUpperCase()} 
                                    secondary={format === 'markdown' ? 'Includes images and formatting' :
                                             format === 'docx' ? 'Microsoft Word format' :
                                             format === 'pdf' ? 'Portable Document Format' :
                                             'Raw data format'}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
             </DialogContent>                                                                                                                                          
             <DialogActions>                                                                                                                                           
                 <Button onClick={onClose}>Cancel</Button>                                                                                                             
                 <Button                                                                                                                                               
                     onClick={() => onSave(selectedFormat)}                                                                                                            
                     variant="contained"                                                                                                                               
                     color="primary"                                                                                                                                   
                 >                                                                                                                                                     
                     Save                                                                                                                                              
                 </Button>                                                                                                                                             
             </DialogActions>                                                                                                                                          
         </Dialog>                                                                                                                                                     
     );                                                                                                                                                                
 };                
