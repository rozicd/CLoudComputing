import React, { useState, useRef, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import axios from 'axios';
import { Buffer } from 'buffer';
import FolderIcon from '@mui/icons-material/Folder';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolder from '@mui/icons-material/CreateNewFolder'
import DialogComponent from "./itemdetails"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import './home.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { blue, green, orange, red, purple } from '@mui/material/colors';

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showAlbumCreationDialog, setShowAlbumCreationDialog] = useState(false);

  const [albumName, setAlbumName] = useState('default');
  const [username, setUsername] = useState('');
  const [usernames, setUsernames] = useState([]);

  const [albumsUsernames, setAlbumUsernames] = useState([]);
  const [albumsUsernamesInput, setAlbumUsernamesInput] = useState('');
  const [showAlbumEditDialog, setShowAlbumEditDialog] = useState(false);

  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const fileInputRef = useRef(null);
  const [content, setContent] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [sharedContent, setSharedContent] = useState([]);
  const [sharedAlbums, setSharedAlbums] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const albumQueryParam = queryParams.get('album');
  const defaultAlbumName = 'default';
  
  const [albumNamePath, setAlbumNamePath] = useState(albumQueryParam || defaultAlbumName);



  const navigate = useNavigate();
  const loadData = async () => {
    const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/getusercontent';
    const endpoint_shared = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/getsharedcontent';
    console.log('Component loaded');
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    try {
      

      const response = await axios.get(endpoint, {
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
        },
        params: {
          album: albumNamePath, 
        },
      });
      console.log(response.data);
      if (albumNamePath == "All")
      {
        setContent(sharedContent);
      }
      else {
      setContent(response.data.response);
      }
    } catch (error) {
      console.log('Error retrieving content:', error);
    }
    try {
      

      const response = await axios.get(endpoint_shared, {
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      setSharedContent(response.data.response.files)
      setSharedAlbums(response.data.response.albums)
    } catch (error) {
      console.log('Error retrieving content:', error);
    }



  };

  
  const loadAlbums = async () => {
    const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/getuseralbums';
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
  
      const response = await axios.get(endpoint, {
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json',
        },
      });
  
      console.log("albumi");
      console.log(response.data.Items);
      setAlbums(response.data.Items);
  
      if (response.data.Items.length === 0) {
        handleAlbumCreation();
        sendSubscription();
      }
    } catch (error) {
      console.log('Error retrieving content:', error);
    }
  };


  useEffect(() => {
    
    loadData();
    loadAlbums();
    return () => { };
  }, [albumNamePath]);

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

  const handleCaptionChange = (event) => {
    const newCaption = event.target.value;
    if (newCaption.length <= 30) {
      setCaption(newCaption);
    }
  };
  
  const handleFileUpload = async () => {

    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const fileName = selectedFile.name.trim();
    if (fileName.length > 30) {
      alert('File name should be less than or equal to 30 characters.');
      return;
    }
    if (fileName.includes(' ')) {
      alert('File name should not contain whitespace.');
      return;
    }

    try {
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/uploadfileasync';

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
            caption: caption,
            tags: tags
          },
          foldername: albumNamePath
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
            //loadData()
          console.log(response);
        } else {
          // Handle error
          console.error('Error uploading file');
        }
      };
        } catch (error) {
        console.error('Error uploading file:', error);
      }
      setTags([])
      setCaption('')
      setSelectedFile(null);
      setShowConfirmationDialog(false);
    };
    const handleAddAlbum = () =>{
        setShowAlbumCreationDialog(true);
        
    }
    const sendSubscription = async() => {
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/subscribe';
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      

      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,

        },
      });
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
      setTags([])
      setCaption('')
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

  const handleTagAdd = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagDelete = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleUsernameAdd = () => {
    if (albumsUsernamesInput.trim() !== '') {
      setAlbumUsernames([...albumsUsernames, albumsUsernamesInput.trim()]);
      setAlbumUsernamesInput('');
    }
  };
  
  const handleUsernamesDelete = (index) => {
    const newUsernames = [...albumsUsernames];
    newUsernames.splice(index, 1);
    setAlbumUsernames(newUsernames);
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

  const setAlbumsSharedUsers = (albumName) =>{
    albums.forEach(album=>{
      if (album.contentId.includes(albumName)){
        setAlbumUsernames(album.sharedUsers)
      }
    })

  }

  const handleAlbumChange = (albumName) => {
    setAlbumNamePath(albumName);
    setAlbumsSharedUsers(albumName)
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('album', albumName);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);  };

  const handleAddUsername = () => {
    usernames.push(username)
    setUsernames(usernames)
    setUsername('');
    console.log(usernames)
  }
  const handleAllClick = (albumName) =>
  {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('album', "Shared");
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newUrl); 
      setContent(sharedContent);
  }

  const handleEditAlbum = async(fileName) =>{
    setShowAlbumEditDialog(true)
    console.log("edit "+fileName)
  }

  const handleCanacelEditAlbum = () => {
    setShowAlbumEditDialog(false)
    setAlbumUsernamesInput('')
  }

  const handleEditAlbumConfirmation = async() =>{
    console.log("############ovo ce se promeniti")
    console.log(albumNamePath)
    try{
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/updateuseralbum'
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    const album = {
      album :{
          albumname : albumNamePath,
          sharedusers: albumsUsernames
      }
    }
    const response = await axios.put(
      endpoint,
      JSON.stringify(album),
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      window.location.reload();
      console.log('Album updated');
    } else {
      window.location.reload();
      console.error('Error updating file');
    }
    }catch(error){
      console.error(error)
    }

  }

  const handleDeleteAlbum = async(fileName) =>{
    try {
      const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/deletealbum/'+fileName;
      console.log(endpoint)
        const session = await Auth.currentSession();
        const token = session.getIdToken().getJwtToken();

        const response = await axios.delete(endpoint, {
          headers: {
            "Authorization": token,
            'Content-Type': 'application/json',
          },
          params: {
            album: fileName, 
          }
        });


        if (response.status === 200) {
          window.location.reload();

              console.log('File deleted');
              } else {
              window.location.reload();
              console.error('Error deleting file');
              }
        } catch (error) {
        console.error('Error deleting file:', error);
      } 

    console.log('delete '+fileName)
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
          <Button onClick={handleAddAlbum} sx={{width:'150px', marginTop: '20px',marginLeft:'20px', alignSelf: 'center',justifySelf:'center',textAlign:'center'}}
          variant="contained"
          color="primary"
          startIcon={<CreateNewFolder />}>
            Add album           </Button>

          <Grid container spacing={2} sx={{marginTop:'20px'}}>
            
              {albums.map((item, index) => {
                const filenameParts = item.contentId.split('-album-');
                const filename = filenameParts[1];

                const showManagingButtons = filename !== 'default'

                return (
                  <Grid item key={index} sx={{ '&:hover': { cursor: 'pointer' } }} onClick={ ()=>handleAlbumChange(filename)}>
                    <Card className='ItemCard'>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                        <FolderIcon sx={{alignSelf:'center',height:'80px',width:'100%',color:orange[300]}}></FolderIcon>
                          
                          <Typography sx={{width:'100%',marginTop:'10px',alignSelf:'center',textAlign:'center'}}>{filename}</Typography>
                          {showManagingButtons && (
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
     
                            <Button sx={{ width: '30px', height: '30px', alignSelf: 'auto', marginBottom:"10px" }} onClick={()=>handleEditAlbum(filename)}><EditIcon sx={{ width: '25px', height: '30px', color: purple[800] }}/></Button>
                            <Button sx={{ width: '30px', height: '30px', marginBottom:"10px", alignSelf: 'auto' }} onClick={()=>handleDeleteAlbum(filename)}><DeleteForeverIcon sx={{ width: '25px', height: '30px', color: red[800] }} /></Button>
                            
                          </Box>
                        )}
                        </CardContent>
                      </Box>
                      
                    </Card>
                  </Grid>
                );
              })}
              <Grid item  sx={{ '&:hover': { cursor: 'pointer' } }} onClick={ ()=>handleAlbumChange("All")}>
                    <Card className='ItemCard'>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                        <FolderIcon sx={{alignSelf:'center',height:'80px',width:'100%',color:green[300]}}></FolderIcon>
                          
                          <Typography sx={{width:'100%',marginTop:'10px',alignSelf:'center',textAlign:'center'}}>All</Typography>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
              {sharedAlbums.map((item, index) => {
                const filenameParts = item.split('-album-');
                const filename = filenameParts[1]+"("+filenameParts[0] + ")";

                return (
                  <Grid item key={index} sx={{ '&:hover': { cursor: 'pointer' } }} onClick={ ()=>handleAlbumChange("Shared-"+item)}>
                    <Card className='ItemCard'>
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                        <FolderIcon sx={{alignSelf:'center',height:'80px',width:'100%',color:green[300]}}></FolderIcon>
                          
                          <Typography sx={{width:'100%',marginTop:'10px',alignSelf:'center',textAlign:'center'}}>{filename}</Typography>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>

          <Typography sx={{width:'100%',marginTop:'10px',marginLeft:'20px',color:blue[500],fontSize:'32px'}}>{albumNamePath}</Typography>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <Dialog open={showConfirmationDialog} onClose={handleCancelUpload}>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogContent>
              <Typography variant="h6">Are you sure you want to upload the following file?</Typography>
              <Typography>{selectedFile && selectedFile.name}</Typography>
              <TextField autoFocus margin="dense" label="Caption" fullWidth value={caption}       onChange={handleCaptionChange} />
              <Box display="flex" alignItems="center" mt={2}>
                <TextField
                  label="Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd();
                    }
                  }}
                />
                <Button variant="contained" onClick={handleTagAdd} style={{ marginLeft: '8px' }}>
                  Add
                </Button>
              </Box>
              {tags.length > 0 && (
                <Box display="flex" flexWrap="wrap" mt={2}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleTagDelete(index)}
                      style={{ marginRight: '8px', marginTop: '4px' }}
                    />
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelUpload} color="error" variant="contained" startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} color="primary" variant="contained" startIcon={<CloudUploadIcon/>}>
                Upload
              </Button>
            </DialogActions>
          </Dialog>
          

          
        </Grid>
        
        
        <Grid container spacing={2} sx={{marginTop:'20px'}}>
            {content.map((item, index) => {
              const filenameParts = item.metadata.contentId.split('-time-');
            
               

              return (
                  <Grid item key={index}   >
                    <DialogComponent item={item} albumName={albumNamePath} user = {filenameParts[0]} />
                  </Grid>
              );
            })}
        </Grid>

        <Dialog open={showAlbumEditDialog} onClose={handleCanacelEditAlbum}>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogContent>
              <Box display="flex" alignItems="center" mt={2}>
                <TextField
                  label="Usernames"
                  value={albumsUsernamesInput}
                  onChange={(e) => setAlbumUsernamesInput(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleUsernameAdd();
                    }
                  }}
                />
                <Button variant="contained" onClick={handleUsernameAdd} style={{ marginLeft: '8px' }}>
                  Add
                </Button>
              </Box>
              {albumsUsernames.length > 0 && (
                <Box display="flex" flexWrap="wrap" mt={2}>
                  {albumsUsernames.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleUsernamesDelete(index)}
                      style={{ marginRight: '8px', marginTop: '4px' }}
                    />
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCanacelEditAlbum} color="error" variant="contained" startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button onClick={handleEditAlbumConfirmation} color="primary" variant="contained" startIcon={<CloudUploadIcon/>}>
                Update
              </Button>
            </DialogActions>
          </Dialog>
        


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
