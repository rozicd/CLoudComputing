import React, { useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from 'react-router-dom';

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
  return (
    <>
        <Card>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                <Typography variant="h6">{item.metadata.caption}</Typography>
                {item.metadata.type.startsWith('image') ? (
                    <img
                    src={item.content}
                    alt={item.metadata.caption}
                    style={{ objectFit: 'cover', maxHeight: '200px' }}
                    />
                ) : (
                    <div className="default-icon">
                    {/* Add your default icon or placeholder here */}
                    </div>
                )}
                <Typography>
                    {(() => {
                    const filenameParts = item.metadata.contentId.split('-file-');
                    const filename = filenameParts[1].split('-time-')[0];
                    console.log(item.metadata)
                    return filename;
                    })()}
                </Typography>
                <Button onClick={handleClickOpen}>View Details</Button>
                </CardContent>
            </Box>
        </Card>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Item Details</DialogTitle>
            <DialogContent sx={{ marginLeft: '20%', marginRight: '20%', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
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
                <Button onClick={handleClose} variant="contained" color="primary">
                Close
                </Button>
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
            </DialogActions>
            </Dialog>
    </>
  );
}

export default DialogComponent
