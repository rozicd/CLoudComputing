import React, { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import './itemdetails.css';
import { blue, orange, purple } from '@mui/material/colors';

function DialogComponent({ item }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  

  const handleDownload = () => {
    setOpen(false);
  };

  const handleEdit = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
        const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/deletefile/'+item.metadata.contentId;
  
  

          const session = await Auth.currentSession();
          const token = session.getIdToken().getJwtToken();
  
  
  
          const response = await axios.delete(endpoint, {
            headers: {
              "Authorization": token,
              'Content-Type': 'application/json',
            },
          });
  
          if (response.status === 200) {
                console.log('File deleted');
                } else {
                // Handle error
                console.error('Error deleting file');
                }
          } catch (error) {
          console.error('Error deleting file:', error);
        }  };
  return (
    <>
        <Card className='ItemCard' sx={{ '&:hover': { cursor: 'pointer' } ,marginBottom:'10px'}} onClick={handleClickOpen}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
            <Typography variant="h6">{item.metadata.caption}</Typography>
            {item.metadata.type.startsWith('image') ? (
              <ImageIcon sx={{width:'100%',height:'40%',alignSelf:'center',color:blue[800]}} />

            ) : (
              <div className="default-icon">
                {item.metadata.type.startsWith('audio') ? (
                  <MusicNoteIcon sx={{width:'100%',height:'100px',alignSelf:'center',color:purple[800]}}/>
                ) : item.metadata.type.startsWith('video') ? (
                  <VideoLibraryIcon sx={{width:'100%',height:'100px',alignSelf:'center',color:orange[800]}} />
                ) : (
                  <InsertDriveFileIcon sx={{width:'100%',height:'100px',alignSelf:'center',color:blue[800]}} />
                )}
              </div>
            )}
            <Typography sx={{width:'100%',marginTop:'10px',alignSelf:'center',textAlign:'center'}}>{item.metadata.name}</Typography>
            </CardContent>
            </Box>
        </Card>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Item Details</DialogTitle>
            <DialogContent sx={{ marginLeft: '15%', marginRight: '15%', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
                Metadata:
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Name:</Typography>
                <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.name}</Typography>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Caption:</Typography>
                <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.caption}</Typography>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ width: '30%', fontWeight: 'bold', textAlign: 'left' }}>Tags:</Typography>
                <Typography sx={{ width: '70%', textAlign: 'right' }}>{item.metadata.tags.join(', ')}</Typography>
                </div>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                >
                Download
                </Button>
                <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                >
                Edit
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </DialogActions>
            </Dialog>
    </>
  );
}

export default DialogComponent
