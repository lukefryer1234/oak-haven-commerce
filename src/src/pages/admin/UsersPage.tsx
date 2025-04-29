import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp // Optional: if needed for displaying createdAt
} from 'firebase/firestore';
import { db, UserData } from '../../services/firebase'; // Import db instance and UserData type
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Tooltip // For showing full ID on hover maybe
} from '@mui/material';

// Optional helper if displaying createdAt
// const formatDate = (timestamp: Timestamp | undefined): string => { ... };

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, 'users');
        // Order by when they were created, most recent first
        const q = query(usersRef, orderBy('createdAt', 'desc')); 
        
        const querySnapshot = await getDocs(q);
        // Firebase V9 SDK already includes ID in doc.id
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          // No need for explicit id: doc.id if UserData includes it, but ensure type consistency
          // If UserData doesn't include id, create it: { id: doc.id, ...doc.data() }
          ...(doc.data() as Omit<UserData, 'id'>), // Assuming UserData has id
          id: doc.id 
        })) as UserData[]; 
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Fetch once on component mount

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading users...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      {users.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No users found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell align="center">Actions</TableCell> {/* Placeholder */}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.uid} // Use uid as key
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.displayName || '-'} {/* Handle missing display name */}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Tooltip title={user.uid}>
                       <span>{user.uid.substring(0, 8)}...</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {/* Placeholder for future actions like edit role, disable, etc. */}
                    {/* <IconButton size="small"><EditIcon /></IconButton> */}
                    {/* <IconButton size="small"><BlockIcon /></IconButton> */}
                    ...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminUsersPage;

