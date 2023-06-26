import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SmartDisplay from '@mui/icons-material/SmartDisplay';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation } from 'react-router-dom';
import './itemdetails.css';
import { blue, green, orange, purple, red } from '@mui/material/colors';

function DialogComponent({ albumName, item,user }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.metadata.caption);
  const [tags, setTags] = useState(item.metadata.tags);
  const [tagInput, setTagInput] = useState('');
  const [name, setName] = useState(item.metadata.name.split('.')[0]); 
  const [username, setUsername] = useState(); 
  const extension = item.metadata.name.split('.')[1]; 
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const claimUsernameFromSession = async () => {
    
    try {
      const session = await Auth.currentSession();
      const accessToken = session.getAccessToken();
      const username = accessToken.payload.username;
      setUsername(username);
      console.log(username)
      console.log(user)

    } catch (error) {
      console.log('Error claiming username:', error);
    }
    
  };

  useEffect(() => {
    
    claimUsernameFromSession();
    
    return () => { };
  }, []);
  const handleClose = () => {
    if (editing) {
      setName(item.metadata.name);
      setCaption(item.metadata.caption);
      setTags(item.metadata.tags);
    }
    setEditing(false);
    setOpen(false);
    setTagInput('');
  };

  const handleDownload = () => {
    setOpen(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUpdate = async () => {
    try {
      const endpoint =
        'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/updatefile/' +
        item.metadata.contentId;

      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await axios.put(
        endpoint,
        {
          album: albumName,
          name,
          caption,
          tags,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        window.location.reload();
        console.log('File updated');
      } else {
        window.location.reload();
        console.error('Error updating file');
      }
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const endpoint =
        'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/deletefile/' +
        item.metadata.contentId;

      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await axios.delete(endpoint, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        params: {
          album: albumName,
        },
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
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9\s]+$/; // Regular expression to allow only alphanumeric characters and spaces
  
    if (regex.test(value)) {
      setName(value);
    }
  };

  return (
    <>
      <Card
        className="ItemCard"
        sx={{ '&:hover': { cursor: 'pointer' }, marginBottom: '10px' }}
        onClick={handleClickOpen}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            {item.metadata.type.startsWith('image') ? (
              <ImageIcon sx={{ width: '100%', height: '85px', alignSelf: 'center', color: blue[800] }} />
            ) : (
              <div className="default-icon">
                {item.metadata.type.startsWith('audio') ? (
                  <MusicNoteIcon sx={{ width: '100%', height: '85px', alignSelf: 'center', color: purple[800] }} />
                ) : item.metadata.type.startsWith('video') ? (
                  <SmartDisplay sx={{ width: '100%', height: '85px', alignSelf: 'center', color: red[800] }} />
                ) : (
                  <InsertDriveFileIcon sx={{ width: '100%', height: '85px', alignSelf: 'center', color: green[800] }} />
                )}
              </div>
            )}
            <Typography sx={{ width: '100%', marginTop: '10px', alignSelf: 'center', textAlign: 'center' }}>
              {item.metadata.name}
            </Typography>
          </CardContent>
        </Box>
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ marginLeft: '15%', marginRight: '15%', padding: '2rem', display: 'flex', flexDirection: 'column'}}>
          <Typography variant="h6" sx={{ marginBottom: '1rem',textAlign:'center' }}>
            Item details
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem',alignItems:'center'}}>
            <Typography sx={{ width: '20%', fontWeight: 'bold', textAlign: 'left' }}>Name:</Typography>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                <TextField
                  sx={{ flex: '1' }}
                  value={name}
                  onChange={handleNameChange}
                />
                <TextField
                  sx={{ width: '5rem', marginLeft: '0.5rem' }}
                  value={extension}
                  disabled
                />
              </div>
            ) : (
              <Typography sx={{ width: '70%', textAlign: 'right' }}>
                {item.metadata.name}
              </Typography>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Size:</Typography>
            <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.size} B</Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Type:</Typography>
            <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.type}</Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Typography sx={{ textWrap: 'nowrap', width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Last Modified:</Typography>
            <Typography sx={{ width: '70%', textAlign: 'right' }}>{new Date(item.metadata.lastModified * 1).toLocaleString()}</Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Caption:</Typography>
            {editing ? (
              <TextField sx={{ width: '70%', textAlign: 'right' }} value={caption} onChange={(e) => setCaption(e.target.value)} />
            ) : (
              <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.caption}</Typography>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left',flex: '1' }}>Tags:</Typography>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '70%', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    sx={{ flex: '1' }}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={handleAddTag} style={{ marginLeft: '8px' }}>
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {item.metadata.tags.map((tag, index) => (
                  <Chip key={index} label={tag} sx={{ marginBottom: '0.5rem', marginRight: '0.5rem' }} />
                ))}
              </div>
            )}
          </div>
          {editing && (
          <div style={{ display: 'flex', flexWrap: 'wrap',marginTop:'10px' }}>
                  {tags.map((tag, index) => (
                    <Chip key={index} label={tag} sx={{ marginBottom: '0.5rem', marginRight: '0.5rem' }} onDelete={() => handleRemoveTag(index)} />
                  ))}
                </div>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
        {!editing && (
            <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownload}>
              Download
            </Button>
          )}
          {!editing ?  user == username &&(
            <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
          ) : (
            <>
              <Button variant="contained" color="primary" startIcon={<ArrowBackIcon />} onClick={() => {      
                setName(item.metadata.name);
                setCaption(item.metadata.caption);
                setTags(item.metadata.tags);
                setEditing(false)}}>
                Back
              </Button>
              <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleUpdate}>
                Update
              </Button>
            </>
          )}
          {!editing && user == username &&(
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DialogComponent;
