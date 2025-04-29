import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, // Use updateDoc directly as updateDocument might not be imported
  doc, // Import doc to create DocumentReference
  Timestamp 
} from 'firebase/firestore';
import { db, EnquiryData } from '../../services/firebase'; // Adjust path if needed
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
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

// Helper to format Firestore Timestamp or return 'N/A'
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString(); // Use locale string for date and time
  }
  return 'N/A';
};

// Define possible enquiry statuses - ensure this matches EnquiryData type
const enquiryStatuses: EnquiryData['status'][] = ['new', 'inProgress', 'completed'];

const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Use an object to track saving status per enquiry ID
  const [savingStatusMap, setSavingStatusMap] = useState<Record<string, boolean>>({});
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // Fetch enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const enquiriesRef = collection(db, 'enquiries');
        const q = query(enquiriesRef, orderBy('createdAt', 'desc')); 
        
        const querySnapshot = await getDocs(q);
        const fetchedEnquiries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as EnquiryData[]; 
        
        setEnquiries(fetchedEnquiries);
      } catch (err) {
        console.error("Error fetching enquiries:", err);
        setError("Failed to fetch enquiries. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiries();
  }, []); // Fetch once on component mount

  // Handle status change for a specific enquiry
  const handleStatusChange = async (enquiryId: string, event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value as EnquiryData['status'];
    const originalEnquiries = [...enquiries]; // Keep original state for potential revert on error

    // Optimistically update UI
    setEnquiries(prevEnquiries => 
        prevEnquiries.map(enq => 
            enq.id === enquiryId ? { ...enq, status: newStatus } : enq
        )
    );
    setSavingStatusMap(prev => ({ ...prev, [enquiryId]: true })); // Set saving state for this row
    setStatusUpdateError(null);

    try {
      const enquiryRef = doc(db, 'enquiries', enquiryId);
      await updateDoc(enquiryRef, { status: newStatus }); 
      // UI already updated optimistically
    } catch (err) {
      console.error("Error updating enquiry status:", err);
      setStatusUpdateError(`Failed to update status for enquiry ${enquiryId}.`);
      // Revert UI change on error
      setEnquiries(originalEnquiries); 
    } finally {
      setSavingStatusMap(prev => ({ ...prev, [enquiryId]: false })); // Clear saving state for this row
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Loading enquiries...</Typography>
      </Container>
    );
  }

  if (error) { // Primarily fetch error
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Enquiries
      </Typography>
      {statusUpdateError && <Alert severity="error" sx={{ mb: 2 }}>{statusUpdateError}</Alert>}
      
      {enquiries.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No enquiries found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 750 }} aria-label="enquiries table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '15%' }}>Date</TableCell>
                <TableCell sx={{ width: '15%' }}>Name</TableCell>
                <TableCell sx={{ width: '20%' }}>Email</TableCell>
                <TableCell sx={{ width: '15%' }}>Category</TableCell>
                <TableCell sx={{ width: '20%' }}>Message Snippet</TableCell>
                <TableCell sx={{ width: '15%' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow
                  key={enquiry.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{formatDate(enquiry.createdAt)}</TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>{enquiry.productCategory || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title={enquiry.message}>
                        <span>{enquiry.message.substring(0, 50)}{enquiry.message.length > 50 ? '...' : ''}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                     <FormControl size="small" fullWidth disabled={savingStatusMap[enquiry.id]}>
                        <Select
                            id={`status-select-${enquiry.id}`}
                            value={enquiry.status}
                            onChange={(e) => handleStatusChange(enquiry.id, e)}
                            displayEmpty
                        >
                            {enquiryStatuses.map(status => (
                                <MenuItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                         {savingStatusMap[enquiry.id] && <CircularProgress size={20} sx={{ position: 'absolute', top: '50%', right: 35, marginTop: '-10px' }}/>}
                    </FormControl>
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

export default AdminEnquiriesPage;

