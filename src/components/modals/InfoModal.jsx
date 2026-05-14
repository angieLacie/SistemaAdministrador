import React from 'react';
import { Modal, Button } from 'react-bootstrap';
const InfoModal = ({
  show,
  title,
  children,
  size,
  onClose
}) => {
  return <Modal show={show} onHide={onClose} centered size={size}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>;
};
export default InfoModal;