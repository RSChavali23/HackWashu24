// Upload.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

function Upload() {
  const [formData, setFormData] = useState({
    type: '',
    size: '',
    color: '',
    photo: null,
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log("mewo");
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate that a photo is selected
    if (!formData.photo) {
      setError('Please select a photo to upload.');
      return;
    }

    // Create FormData object
    const data = new FormData();
    data.append('type', formData.type);
    data.append('size', formData.size);
    data.append('color', formData.color);
    data.append('photo', formData.photo);

    try {
      const response = await fetch('http://127.0.0.1:5000/uploadClothes', {
        method: 'POST',
        body: data,
      });

      // Log the raw response to see the headers, status, etc.
      console.log("Raw Response:", response);

      // Ensure that the response is of type JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();

        // Log the parsed result for debugging
        console.log("Parsed Response:", result);

        // Check if the response status is in the success range (200-299)
        if (response.ok || response.status === 201) {
          setMessage(result.message);
          setFormData({
            type: '',
            size: '',
            color: '',
            photo: null,
          });
          // Reset the file input
          e.target.reset();
        } else {
          setError(result.error || 'An error occurred while uploading.');
        }
      } else {
        setError('Server returned an unexpected response.');
        console.log("Unexpected content-type:", contentType);
      }

    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Error:', err);
    }
  };


  return (
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
      <Row className="w-100">
        <Col xs={12} className="px-5">
          <h2 className="mb-4 text-center text-white">Upload Your Clothes</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="type" className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g., Shirt, Pants"
                required
              />
            </Form.Group>

            <Form.Group controlId="size" className="mb-3">
              <Form.Label>Size</Form.Label>
              <Form.Control
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., S, M, L, XL"
                required
              />
            </Form.Group>

            <Form.Group controlId="color" className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Red, Blue"
                required
              />
            </Form.Group>

            <Form.Group controlId="photo" className="mb-4">
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Upload
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Upload;
