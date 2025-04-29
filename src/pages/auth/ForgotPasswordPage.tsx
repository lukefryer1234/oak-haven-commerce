import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField as MuiTextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';

import { RootState, AppDispatch } from '../../store';
import { resetPassword, clearError } from '../../store/slices/authSlice';

// Yup validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    // Clear any previous errors/messages when component mounts
    dispatch(clearError());
    setMessage(null);
  }, [dispatch]);

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {message}
          </Alert>
        )}

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setMessage(null); // Clear previous message
            dispatch(clearError()); // Clear previous error
            try {
              await dispatch(resetPassword(values.email)).unwrap();
              setMessage('Password reset email sent. Please check your inbox.');
            } catch (err) {
              console.error('Password reset failed:', err);
              // Error is handled by the slice and displayed in the Alert
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <Field
                as={MuiTextField}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={loading || !!message} // Disable if loading or success message shown
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || isSubmitting || !!message}
              >
                {loading || isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
            </Form>
          )}
        </Formik>

        <Box sx={{ mt: 1, width: '100%', textAlign: 'center' }}>
          <Link component={RouterLink} to="/login">
            Back to Login
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;

