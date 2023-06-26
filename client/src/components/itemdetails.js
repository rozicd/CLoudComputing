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
import { Link } from 'react-router-dom';

function DialogComponent({ item }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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
            <Typography>{item.metadata.filename}</Typography>
            <Typography>{item.metadata.tags.join(', ')}</Typography>
            <Button onClick={handleClickOpen}>View Details</Button>
          </CardContent>
        </Box>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Item Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Metadata:</Typography>
          <p>ID: {item.metadata.contentId}</p>
          <p>Name: {item.metadata.caption}</p>
          {/* Display other item metadata */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DialogComponent
