import React, { useState, useRef, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Card, CardContent, Box, Typography } from '@mui/material';
import axios from 'axios';
import { Buffer } from 'buffer';
import FolderIcon from '@mui/icons-material/Folder';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolder from '@mui/icons-material/CreateNewFolder'
import DialogComponent from "./itemdetails"

import { Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import './home.css';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showAlbumCreationDialog, setShowAlbumCreationDialog] = useState(false);

  const [albumName, setAlbumName] = useState('');
  const [username, setUsername] = useState('');
  const [usernames, setUsernames] = useState([]);

  const fileInputRef = useRef(null);
  const [content, setContent] = useState([]);
  const [albums, setAlbums] = useState([]);

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

  const loadAlbums = async () =>{
    const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/getuseralbums'
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await axios.get(endpoint, {
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
        },
      });
      console.log("albumi")
      console.log(response.data.Items);
      setAlbums(response.data.Items)
    } catch (error) {
      console.log('Error retrieving content:', error);
    }
  }

  useEffect(() => {
    loadData();
    loadAlbums();
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
    console.log(file)
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
    const handleAddAlbum = () =>{
        setShowAlbumCreationDialog(true);
        
    }

    const handleAlbumCreation = async() => {
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/createAlbum'
        const album = {
            album :{
                albumname : albumName,
                sharedusers: usernames
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
                loadAlbums();
                setShowAlbumCreationDialog(false)
                setAlbumName('');
                setUsername('');
                setUsernames([])
              } 
              else if (response.status === 400){
                window.alert(response.message)
              }
              else {
                
                console.error('Error creating album');
              }
        }
        catch(error){
            console.error(error)
        }
  };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setShowConfirmationDialog(false);
    };

    const handleCancelAlbumCreation = () => {
      setShowAlbumCreationDialog(false);
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
  const handleAddUsername = () => {
    usernames.push(username)
    setUsernames(usernames)
    setUsername('');
    console.log(usernames)
  }

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
          <Button onClick={handleAddAlbum} sx={{width:'10%', marginTop: '20px', alignSelf: 'center',justifySelf:'center',textAlign:'center'}}
          variant="contained"
          color="primary"
          startIcon={<CreateNewFolder />}>
            Add album           </Button>

          <Grid container spacing={2} sx={{marginTop:'20px'}}>
            
              {albums.map((item, index) => {
                const filenameParts = item.contentId.split('-album-');
                const filename = filenameParts[1];

                return (
                  <Grid item key={index}>
                    <Card className='ItemCard'>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                        <FolderIcon className='MuiSvgIcon-fontSizeLarge' sx={{alignSelf:'center',height:'80px',width:'100%'}}></FolderIcon>
                          
                          <Typography sx={{width:'100%',marginTop:'10px',alignSelf:'center',textAlign:'center'}}>{filename}</Typography>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
          <hr style={{ marginTop: '20px',width: '100%' }} /> {/* Horizontal line */}
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
        
        <Grid container spacing={2} sx={{marginTop:'20px'}}>
            {content.map((item, index) => {
              const filenameParts = item.metadata.contentId.split('-file-');
            
               

              return (
                  <Grid item key={index}   >
                    <DialogComponent item={item} />
                  </Grid>
              );
            })}
        </Grid>


        <Dialog open={showAlbumCreationDialog} onClose={handleCancelAlbumCreation}>
    <DialogTitle>Album creation</DialogTitle>
    <DialogContent>
      <TextField
        label="Album Name"
        fullWidth
        margin="normal"
        variant="outlined"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
        // Add the necessary props and onChange handler as needed
      />

      <TextField
        label="Usernames"
        fullWidth
        margin="normal"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        // Add the necessary props and onChange handler as needed
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddUsername}
        // Add onClick handler for the add button next to the usernames input field
      >
        Add
      </Button>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCancelAlbumCreation}
      variant="contained"
      startIcon= {<CancelIcon/>}
      color="error"
      >Cancel</Button>
      <Button onClick={handleAlbumCreation}
      variant="contained"
      color="primary"
        startIcon={<CloudUploadIcon />}
      >Upload</Button>
    </DialogActions>
    </Dialog>
        
      </Grid>
    </div>
  );
}

export default Home;
