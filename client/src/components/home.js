import React, { useState, useRef, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Card, CardContent, Box, Typography } from '@mui/material';
import axios from 'axios';
import { Buffer } from 'buffer';
import DialogComponent from "./itemdetails"

import { Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './home.css';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const fileInputRef = useRef(null);
  const [content, setContent] = useState([]);
  const navigate = useNavigate();
  const loadData = async () => {
    const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/getusercontent';
    console.log('Component loaded');

    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await axios.get(endpoint, {
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      setContent(response.data.response);
    } catch (error) {
      console.log('Error retrieving content:', error);
    }
  };

  useEffect(() => {
    loadData();

    return () => { };
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log('Error signing out:', error);
    }
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

    try {
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/uploadfile';

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const fileContent = reader.result.split(',')[1];

        const fileData = {
          file: {
            content: fileContent,
            filename: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            lastModified: selectedFile.lastModified,
            caption: '',
            tags: ["No"]
          },
          foldername: '' // Set the folder name if required
        };
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        console.log(token)


        // Add the token to the request headers

        const response = await axios.post(endpoint, JSON.stringify(fileData), {
          headers: {
            "Authorization": token,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
            loadData()
          console.log('File uploaded');
        } else {
          // Handle error
          console.error('Error uploading file');
        }
      };
        } catch (error) {
        console.error('Error uploading file:', error);
      }
  
      setSelectedFile(null);
      setShowConfirmationDialog(false);
    };
    const handleAddAlbum = async () =>{
        const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/createAlbum'
        const album = {
            album :{
                albumname : "nekialbum2",
                sharedusers: []
            }
        }
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        try{
            const response = await axios.post(endpoint, JSON.stringify(album), {
                headers: {
                  "Authorization": token,
                  'Content-Type': 'application/json',
                },
              });
        
              if (response.status === 200) {
                console.log('Album created');
              } else {
                
                console.error('Error creating album');
              }
        }
        catch(error){
            console.error(error)
        }
        
    
    }
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
          <Button color="inherit" className="signout-button" onClick={handleSignOut}>
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
              <div className="center-cloud-upload">

                <Typography variant="h6">Drag and drop your file here</Typography>
              </div>)
            }
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
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
        
        <Grid container spacing={2}>
            {content.map((item, index) => {
              const filenameParts = item.metadata.contentId.split('-file-');
              const filename = filenameParts[1].split('-time-')[0];
              var base64Content = "data:"+item.metadata.type+";base64,"+Buffer.from(item.content).toString('base64');
              var decodedContent = Buffer.from(base64Content,'base64').toString('utf-8')

              return (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <DialogComponent item={item} />
                  </Grid>
              );
            })}
        </Grid>            
        <Button onClick={handleAddAlbum}>add album </Button>
      </Grid>
    </div>
  );
}

export default Home;
