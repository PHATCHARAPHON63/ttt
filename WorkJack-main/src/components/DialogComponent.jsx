import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function DialogComponent({ open, onClose, title, content }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogComponent;