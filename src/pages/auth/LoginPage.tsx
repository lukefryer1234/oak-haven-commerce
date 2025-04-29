import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  Divider,
  Stack,
} from '@mui/material';
import { Google as GoogleIcon, Apple as AppleIcon } from '@mui/icons-material';

import { RootState, AppDispatch } from '../../store';
import { login, loginWithGoogleAuth, loginWithAppleAuth, clearError } from '../../store/slices/authSlice';

// Yup validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Get redirect location from state or default to account page
  const from = location.state?.from || '/account';

  React.useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogleAuth()).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google login failed:', err);
      // Error is already handled by the slice
    }
  };

  const handleAppleLogin = async () => {
    try {
      await dispatch(loginWithAppleAuth()).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Apple login failed:', err);
      // Error is already handled by the slice
    }
  };

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
          Log In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await dispatch(login(values)).unwrap();
              navigate(from, { replace: true }); // Redirect after successful login
            } catch (err) {
              // Error is handled by the slice and displayed in the Alert
              console.error('Login failed:', err);
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
                disabled={loading}
              />
              <Field
                as={MuiTextField}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? <CircularProgress size={24} /> : 'Log In'}
              </Button>
            </Form>
          )}
        </Formik>

        <Box sx={{ width: '100%', textAlign: 'right', mb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Divider sx={{ width: '100%', mb: 2 }}>OR</Divider>

        <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ justifyContent: 'center' }}
          >
            Continue with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AppleIcon />}
            onClick={handleAppleLogin}
            disabled={loading}
            sx={{ justifyContent: 'center', color: 'black', borderColor: 'rgba(0, 0, 0, 0.23)' }}
          >
            Continue with Apple
          </Button>
        </Stack>

        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;

