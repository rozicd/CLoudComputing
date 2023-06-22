import React, { useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './home.css';

function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const fileInputRef = useRef(null);

    const handleSignOut = async () => {
        // try {
        //     await Auth.signOut();
        //     window.location.reload();
        // } catch (error) {
        //     console.log('Error signing out:', error);
        // }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setShowConfirmationDialog(false);
            return;
        }
        setSelectedFile(file);
        setShowConfirmationDialog(true);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        // try {
        //     const filename = selectedFile.name;
        //     const result = await Storage.put(filename, selectedFile);
        //     console.log('Uploaded file:', result.key);
        //     alert('File uploaded successfully');
        // } catch (error) {
        //     console.error('Error uploading file:', error);
        //     alert('Error uploading file');
        // }
        setSelectedFile(null);
        setShowConfirmationDialog(false)
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setShowConfirmationDialog(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedFile(event.dataTransfer.files[0]);
        setShowConfirmationDialog(true);
    };
    const handleDropZoneClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return (
        <div className="home-container">
            <AppBar position="static" className="home-app-bar">
                <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    File storage app
                </Typography>
                <Button color="inherit" className ="signout-button" onClick={handleSignOut}>
                    Sign Out
                </Button>
                </Toolbar>
            </AppBar>
            <Grid direction="column" className="home-content">
                <Grid item xs={12} md={6} className="home-upload">
                <div
                    className={`home-dropzone ${selectedFile ? 'home-has-file' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleDropZoneClick}
                >
                    {selectedFile ? (
                    <div>
                        <Typography variant="h6">Selected file:</Typography>
                        <Typography>{selectedFile.name}</Typography>
                    </div>
                    ) : (
                    <div className = "center-cloud-upload">
                        <CloudUploadIcon sx={{ fontSize: 100 }} className="home-upload-icon" />
                        <Typography variant="h6">Drag and drop your file here</Typography>
                    </div>    )}     
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} />
                <Dialog open={showConfirmationDialog} onClose={handleCancelUpload}>
                    <DialogTitle>Confirm Upload</DialogTitle>
                    <DialogContent>
                        <Typography variant="h6">Are you sure you want to upload the following file?</Typography>
                        <Typography>{selectedFile && selectedFile.name}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelUpload}>Cancel</Button>
                        <Button onClick={handleFileUpload}>Upload</Button>
                    </DialogActions>
                </Dialog>
                </Grid>
            </Grid>
        </div>
    );
}
export default Home;
